import TextAlign from "../TextAlign";
import Sprite = Laya.Sprite;
import Box = Laya.Box;
import Label = Laya.Label;
import Tween = Laya.Tween;
import Image = Laya.Image;

/**
 * h5 only
 */
export default class NotifyQueue {
    private static sDefault: NotifyQueue = null;

    private _fixWidth: number = undefined;
    private _beginX: number = undefined;
    private _beginY: number = undefined;
    private _downward: boolean = false;

    private _inited: boolean = false;
    private _id: number = 0;
    private _queue: NotifyContent[] = [];

    constructor(fixWidth: number = undefined, beginX: number = undefined, beginY: number = undefined, downward: boolean = false) {
        this._fixWidth = fixWidth;
        this._beginX = beginX;
        this._beginY = beginY;
        this._downward = downward;
    }

    public add(str: string, align: string): number {
        if (!this._inited) {
            this._inited = true;
            Laya.timer.frameLoop(1, this, this.loop);
        }
        for (let i = 0; i < this._queue.length; i++) {
            Laya.Tween.to(this._queue[i], {
                "y": (this._queue[i].y + (this._queue[i].getContentHeight() + 4) * (this._downward ? 1 : -1))
            }, 100, null, null, 0, false);
        }

        let content: NotifyContent = new NotifyContent(str, align, this._id, this._fixWidth);

        content.x = (this._beginX == undefined ? content.getAttachX() : this._beginX);
        content.y = (this._beginY == undefined ? (1 / 2 * Laya.stage.height) : this._beginY);
        content.height = content.getContentHeight();
        content.pivotY = content.height / 2;
        content.alpha = 0;

        Laya.stage.addChild(content);
        Tween.to(content, {"alpha": 1}, 100);
        this._queue.push(content);
        this.refreshId();

        return this._id;
    }

    public dispose(): void {
        for (let i = 0; i < this._queue.length; i++) {
            let content: NotifyContent = this._queue[i];

            content.parent.removeChild(this._queue[i]);

            Tween.clearAll(content);
        }
        Laya.timer.clear(this, this.loop);
    }

    private loop(): void {
        let timeNow: number = new Date().getTime();
        for (let i = 0; i < this._queue.length; i++) {
            let content: NotifyContent = this._queue[i];
            if (content.timestamp + content.delay <= timeNow) {
                content.parent.removeChild(content);

                Tween.clearAll(content);

                this._queue.splice(i, 1);

                i--;
            }
        }
    }

    private refreshId(): void {
        if ((++this._id) > 0x0FFFFFFF) {
            this._id = 0;
        }
    }

    public static add(str: string, align: string = TextAlign.CENTER): number {
        if (NotifyQueue.sDefault == null) {
            NotifyQueue.sDefault = new NotifyQueue();
        }
        return NotifyQueue.sDefault.add(str, align);
    }
}

class NotifyContent extends Sprite {
    private static readonly BACK_INIT_WIDTH:number = 343;
    private static readonly BACK_INIT_HEIGHT:number = 26;

    private static readonly PADDING: number = 5;
    private static readonly LEADING: number = 5;

    public readonly content: string;
    public readonly align: string;
    public readonly id: number;
    public readonly delay: number;
    public readonly timestamp: number;

    private readonly back: Image;
    private textQueue: Label[][];
    private textContainer: Box;

    constructor(content: string, align: string, id: number, width: number) {
        super();
        var pad: number = NotifyContent.PADDING;
        this.content = content;
        this.align = align;
        this.id = id;
        this.delay = 2000;
        this.timestamp = new Date().getTime();
        this.textQueue = [];
        this.textContainer = new Box();

        var strs = content.split("<br>");
        for (var line = 0; line < strs.length; line++) {
            this.textQueue.push([]);
            var str = strs[line];
            var pos = 0;
            var arr: string[] = str.match(/<font color=(.*?)<\/font>/g);
            if (arr) {
                for (var i = 0; i < arr.length; i++) {
                    let index = str.indexOf(arr[i], pos);
                    if (index >= pos) {
                        if (index > pos) {
                            this.textQueue[line].push(this.createText(line, str.substring(pos, index)));
                        }
                        pos = index + "<font color='".length;
                        let color = str.substr(pos, "#000000".length);
                        pos += color.length + "'>".length;
                        index = pos + arr[i].length - "<font color='#000000'>".length - "</font>".length;
                        this.textQueue[line].push(this.createText(line, str.substring(pos, index), color));
                        pos = index + "</font>".length;
                    }
                }
            }
            if (pos < str.length) {
                this.textQueue[line].push(this.createText(line, str.substr(pos)));
            }
        }
        // this.back = new Sprite();
        this.back = new Image("common/notify/img_notify.png");
        this.back.size(NotifyContent.BACK_INIT_WIDTH,NotifyContent.BACK_INIT_HEIGHT);
        this.back.sizeGrid = "8,149,8,129";
        width = this.getTextWidth();
        this.textContainer.width = width;
        this.textContainer.height = this.getTextHeight();
        let newBackWidth:number = width + pad * 2;
        let newBackHeight:number = this.textContainer.height + NotifyContent.LEADING * 2;
        // this.back.graphics.drawRect(-pad, -pad, width + pad * 2, this.textContainer.height + pad * 2, 0x0);
        // this.back.alpha = 0.75;
        if(newBackWidth < NotifyContent.BACK_INIT_WIDTH){
            newBackWidth = NotifyContent.BACK_INIT_WIDTH;
        }
        this.textContainer.x = (newBackWidth - this.textContainer.width) / 2;
        this.textContainer.y = 1 + (newBackHeight - this.textContainer.height) / 2;//强行往下1个像素
        this.back.size(newBackWidth,newBackHeight);

        this.addChild(this.back);
        this.addChild(this.textContainer);
        this.textContainer.width = width;
        this.mouseEnabled = false;

        this.size(newBackWidth,newBackHeight);
    }

    public getAttachX(): number {
        return Laya.stage.width / 2 - this.width / 2;
    }

    public getContentHeight(): number {
        return this.height + NotifyContent.PADDING * 2;
    }

    private createText(line: number, str: string, color: string = "#ffffff"): Label {
        let text: Label = new Label();
        text.font = "Microsoft YaHei";
        text.fontSize = 14;
        text.color = color;
        // text.strokeColor = "#2d7fdb";
        // text.stroke = 3;
        text.text = str;
        let length = this.textQueue[line].length;
        if (length > 0) {
            text.x = this.textQueue[line][length - 1].x + this.textQueue[line][length - 1].displayWidth;
        }
        text.y = line * (text.displayHeight + NotifyContent.LEADING);
        switch (this.align) {
            case TextAlign.LEFT:
                text.left = 0;
                break;
            case TextAlign.CENTER:
                text.centerX = 0;
                break;
            case TextAlign.RIGHT:
                text.right = 0;
                break;
        }
        this.textContainer.addChild(text);

        return text;
    }

    private getTextWidth(): number {
        let width = 0;
        for (var i = 0; i < this.textQueue.length; i++) {
            let sum = 0;
            for (var j = 0; j < this.textQueue[i].length; j++) {
                sum += this.textQueue[i][j].displayWidth;
            }
            width = Math.max(width, sum);
        }
        return width;
    }

    private getTextHeight(): number {
        return this.textQueue[0][0].displayHeight * this.textQueue.length + NotifyContent.LEADING * (this.textQueue.length - 1);
    }
}