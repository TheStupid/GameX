export default interface ISerializable {
    serialize():string;
    deserialize(data:object): void;
}