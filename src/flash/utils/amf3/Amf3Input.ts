import ByteArray from '../ByteArray';
import Amf3Types from './Amf3Types';
import TraitsInfo from './TraitsInfo';

export default class Amf3Input {

    private data: ByteArray;

    private objectTable: Object[] = [];
    private stringTable: string[] = [];
    private traitsTable: TraitsInfo[] = [];

    constructor(data: ByteArray) {
        this.data = data;
    }

    public readObject(): any {
        let type = this.data.readByte();
        return this.readObjectValue(type);
    }

    private readObjectValue(type: number): any {
        let value: any = null;
        switch (type) {
            case Amf3Types.kUndefinedType:
                value = undefined;
                break;
            case Amf3Types.kFalseType:
                value = false;
                break;
            case Amf3Types.kTrueType:
                value = true;
                break;
            case Amf3Types.kIntegerType:
                value = this.readUInt29();
                value = (value << 3) >> 3;
                break;
            case Amf3Types.kDoubleType:
                value = this.data.readFloat64();
                break;
            case Amf3Types.kStringType:
                value = this.readString();
                break;
            case Amf3Types.kArrayType:
                value = this.readArray();
                break;
            case Amf3Types.kObjectType:
                value = this.readScriptObject();
                break;
            case Amf3Types.kByteArrayType:
                value = this.readByteArray();
                break;
        }
        return value;
    }

    private readString(): string {
        let ref = this.readUInt29();
        if ((ref & 0x1) == 0) {
            return this.getStringReference(ref >> 1);
        }
        let len = ref >> 1;
        if (0 == len) {
            return "";
        }

        let str = this.readUTF(len);
        this.stringTable.push(str);
        return str;
    }

    private readArray(): Object {
        let ref = this.readUInt29();
        if ((ref & 0x1) == 0) {
            return this.getObjectReference(ref >> 1);
        }
        let len = ref >> 1;
        let key = this.readString();
        if (key == "") {
            let array = [];
            for (var i = 0; i < len; i++) {
                var value = this.readObject();
                array.push(value);
            }
            return array;
        }

        var object = {};
        while (key != "") {
            object[key] = this.readObject();
            key = this.readString();
        }

        for (let i = 0; i < len; i++) {
            object[i] = this.readObject();
        }
        return object;
    }

    private readScriptObject(): Object {
        let ref = this.readUInt29();

        if ((ref & 0x1) == 0) {
            return this.getObjectReference(ref >> 1);
        }

        let ti = this.readTraits(ref);
        let className = ti.getClassName();
        let externalizable = ti.isExternalizable();
        let object: Object = {};
        if (externalizable) {
            object = this.readObject();
        }
        else {
            let len: number = ti.getProperties().length;
            for (let i = 0; i < len; i++) {
                let propName = ti.getProperty(i);
                let value = this.readObject();
                object[propName] = value;
            }

            if (ti.isDynamic()) {
                for (; ;) {
                    let name = this.readString();
                    if ((name == null) || (name.length == 0))
                        break;
                    let value = this.readObject();
                    object[name] = value;
                }
            }
        }
        this.objectTable.push(object);
        return object;
    }

    private readByteArray(): ByteArray {
        let ref = this.readUInt29();
        if ((ref & 0x1) == 0) {
            return <ByteArray>this.getObjectReference(ref >> 1);
        }
        let len = ref >> 1;
        let ba = new ByteArray();
        this.objectTable.push(ba);
        for (let i = 0; i < len; i++) {
            ba.writeByte(this.data.readByte());
        }
        return ba;
    }

    private readUInt29(): number {
        let b = this.data.readByte() & 0xFF;
        if (b < 128) {
            return b;
        }
        let value = (b & 0x7F) << 7;
        b = this.data.readByte() & 0xFF;
        if (b < 128) {
            return value | b;
        }
        value = (value | b & 0x7F) << 7;
        b = this.data.readByte() & 0xFF;
        if (b < 128) {
            return value | b;
        }
        value = (value | b & 0x7F) << 8;
        b = this.data.readByte() & 0xFF;
        return value | b;
    }

    private readTraits(ref: number): TraitsInfo {
        if ((ref & 0x3) == 1) {
            return this.getTraitReference(ref >> 2);
        }

        let externalizable = (ref & 0x4) == 4;
        let dynamic = (ref & 0x8) == 8;
        let count = ref >> 4;
        let className = this.readString();

        let ti = new TraitsInfo(className, dynamic, externalizable);
        this.traitsTable.push(ti);
        for (let i = 0; i < count; i++) {
            let propName = this.readString();
            ti.addProperty(propName);
        }
        return ti;
    }

    private readUTF(utflen: number): string {
        return this.data.readUTFBytes(utflen);
    }

    private getObjectReference(ref: number): Object {
        return this.objectTable[ref];
    }

    private getStringReference(ref: number): string {
        return this.stringTable[ref];
    }

    private getTraitReference(ref: number): TraitsInfo {
        return this.traitsTable[ref];
    }
}