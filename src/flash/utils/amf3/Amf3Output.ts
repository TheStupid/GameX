import ByteArray from '../ByteArray';
import Amf3Types from './Amf3Types';
import Dictionary from '../../../util/Dictionary';

export default class Amf3Output {

    private data: ByteArray;

    private objectTable: Dictionary<any, any> = new Dictionary();
    private stringTable: Dictionary<any, any> = new Dictionary();
    private traitsCount = 0;

    constructor(data: ByteArray) {
        this.data = data;
    }

    public writeObject(o: Object): void {
        if (o == null) {
            this.writeAMFNull();
            return;
        }
        if (typeof o === "string") {
            this.writeAMFString(o);
        } else if (typeof o === "number") {
            if (o === +o && o === (o | 0)) {
                this.writeAMFInt(o);
            } else {
                this.writeAMFDouble(o);
            }
        } else if (typeof o === "boolean") {
            this.writeAMFBoolean(o);
        } else if (o.constructor === Array) {
            this.writeAMFArray(o);
        } else if (o instanceof ByteArray) {
            this.writeAMFByteArray(o);
        } else {
            this.writeMap(o);
        }
    }

    private writeAMFNull() {
        this.data.writeByte(Amf3Types.kNullType);
    }

    private writeAMFString(s: string): void {
        this.data.writeByte(Amf3Types.kStringType);
        this.writeStringWithoutType(s);
    }

    private writeAMFInt(i: number): void {
        if ((i >= -268435456) && (i <= 268435455)) {
            i &= 0x1FFFFFFF;
            this.data.writeByte(Amf3Types.kIntegerType);
            this.writeUInt29(i);
        } else {
            this.writeAMFDouble(i);
        }
    }

    private writeAMFDouble(d: number): void {
        this.data.writeByte(Amf3Types.kDoubleType);
        this.data.writeFloat64(d);
    }

    private writeAMFBoolean(b: boolean): void {
        if (b) {
            this.data.writeByte(Amf3Types.kTrueType);
        } else {
            this.data.writeByte(Amf3Types.kFalseType);
        }
    }

    private writeAMFArray(o: Object): void {
        this.data.writeByte(Amf3Types.kArrayType);
        var len = (<any[]>o).length;
        if (!this.objectByReference(o)) {
            this.writeUInt29((len << 1) | 1);
            this.writeUInt29(1);
            if (len > 0) {
                for (var i = 0; i < len; i++) {
                    this.writeObject(o[i]);
                }
            }
        }
    }

    private writeAMFByteArray(ba: ByteArray): void {
        this.data.writeByte(Amf3Types.kByteArrayType);
        if (!this.objectByReference(ba)) {
            let length = ba.length;
            this.writeUInt29(length << 1 | 0x1);
            for (let i = 0; i < ba.length; i++) {
                this.data.writeByte(ba.byte(i));
            }
        }
    }

    private writeMap(o: Object) {
        this.data.writeByte(Amf3Types.kObjectType);
        if (!this.objectByReference(o)) {
            this.writeUInt29(11);
            this.traitsCount++;
            this.writeStringWithoutType("");
            for (let key in o) {
                if (key) {
                    this.writeStringWithoutType(key);
                } else {
                    this.writeStringWithoutType("");
                }
                this.writeObject(o[key]);
            }
            this.writeStringWithoutType("");
        }
    };

    private writeStringWithoutType(s: string): void {
        if (s.length == 0) {
            this.writeUInt29(1);
            return;
        }
        if (!this.stringByReference(s)) {
            let utflen = 0;
            for (let i = 0; i < s.length; i++) {
                let c = s.charCodeAt(i);
                if (c <= 127) {
                    utflen++;
                }
                else if (c > 2047) {
                    utflen += 3;
                }
                else {
                    utflen += 2;
                }
            }
            this.writeUInt29(utflen << 1 | 0x1);
            this.writeUTF(s);
            return;
        }
    }

    private writeUInt29(ref: number): void {
        if (ref < 128) {
            this.data.writeByte(ref);
        }
        else if (ref < 16384) {
            this.data.writeByte(ref >> 7 & 0x7F | 0x80);
            this.data.writeByte(ref & 0x7F);
        }
        else if (ref < 2097152) {
            this.data.writeByte(ref >> 14 & 0x7F | 0x80);
            this.data.writeByte(ref >> 7 & 0x7F | 0x80);
            this.data.writeByte(ref & 0x7F);
        }
        else if (ref < 1073741824) {
            this.data.writeByte(ref >> 22 & 0x7F | 0x80);
            this.data.writeByte(ref >> 15 & 0x7F | 0x80);
            this.data.writeByte(ref >> 8 & 0x7F | 0x80);
            this.data.writeByte(ref & 0xFF);
        }
        else {
            throw new Error("Integer out of range: " + ref);
        }
    }

    private writeUTF(s: string): void {
        this.data.writeUTFBytes(s);
    }

    private objectByReference(o: Object): boolean {
        let ref: Object = this.objectTable.getValue(o);
        if (ref != null) {
            let refNum = Number(ref);
            this.writeUInt29(refNum << 1);
        }
        else {
            this.objectTable.setValue(o, this.objectTable.size());
        }
        return ref != null;
    }

    private stringByReference(s: string): boolean {
        let ref = this.stringTable.getValue(s);
        if (ref != null) {
            let refNum = Number(ref);
            this.writeUInt29(refNum << 1);
        }
        else {
            this.stringTable.setValue(s, this.stringTable.size());
        }
        return ref != null;
    }
}