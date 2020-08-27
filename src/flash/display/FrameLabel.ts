export default class FrameLabel {

    private _name: string;
    private _frame: number;

    constructor(name: string, frame: number) {
        this._name = name;
        this._frame = frame;
    }

    /**
     * 标签的名称。
     * @readonly
     * @type {string}
     */
    public get name(): string {
        return this._name;
    }

    /**
     * 包含标签的帧编号。
     * @readonly
     * @type {number}
     */
    public get frame(): number {
        return this._frame;
    }
}