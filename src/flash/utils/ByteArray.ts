import Amf3Input from './amf3/Amf3Input';
import Amf3Output from './amf3/Amf3Output';
/**
  * 仿制Flash的ByteArray
  * @author ligenhao
  * @export
  * @class ByteArray
  * @extends {Laya.Byte}
  */
export default class ByteArray extends Laya.Byte {

    constructor() {
        super();
        this.endian = Laya.Byte.BIG_ENDIAN;//默认大端字节序
    }

    /**
     * 从字节数组中读取一个以 AMF 序列化格式进行编码的对象。
     */
    public readObject(): any {
        return new Amf3Input(this).readObject();
    }

    /**
     * 将对象以 AMF 序列化格式写入字节数组。
     * @param object 
     */
    public writeObject(object: any): void {
        new Amf3Output(this).writeObject(object);
    }

    /**
     * 获取指定下标的字节数值。
     * @param index
     */
    public byte(index: number): number {
        return this._u8d_[index];
    }
}