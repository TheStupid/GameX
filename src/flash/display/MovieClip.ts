import MovieData from './MovieData';
import FrameLabel from './FrameLabel';
import Loader from '../../loader/Loader';
import Animation = Laya.Animation;
import Handler = Laya.Handler;
import Sprite = Laya.Sprite;
import Event = Laya.Event;
import StringUtil from "../../util/StringUtil";

/**
 * 仿制Flash的MovieClip
 * @author ligenhao
 * @export
 * @class MovieClip
 * @extends {Laya.Sprite}
 */
export default class MovieClip extends Sprite {
    private static readonly DEFAULT_MOVIE = "mc";

    private _url: string;
    private _movieDatas: MovieData[] = [];
    private _animation: Animation;
    private _currentMovieData: MovieData = null;
    private _frameScripts: Object;

    constructor(url?: string) {
        super();
        if(url){
            this.init(url);
        }
    }

    init(url:string):void{
        if(StringUtil.isNullOrEmpty(url)){
            return;
        }

        this._url = url;
        this.initData();
        this.reset();
        if (this.movies.indexOf(MovieClip.DEFAULT_MOVIE) != -1) {//包含"mc"动画
            this.gotoAndStop(1, MovieClip.DEFAULT_MOVIE);
        }
    }

    /**
     * 下载图集动画资源（json文件）
     */
    public static load(url: string, loaded: Handler = null): void {
        Loader.load(url, loaded, null, Loader.ATLAS);
    }

    /**
     * 是否已经加载指定动画
     */
    public static hasMovie(url: string, movie: string = null): boolean {
        let data = Loader.getRes(url);
        if (data == null) {
            return false;
        }
        let movies: Object = data["movies"];
        if (movies != null) {
            if (movie == null || movie == MovieClip.DEFAULT_MOVIE) {
                return true;
            }
            return movies.hasOwnProperty(movie);
        }
        return false;
    }

    /**
     * 一个布尔值，指示影片剪辑当前是否正在播放。
     */
    public get isPlaying(): boolean {
        return this._animation.isPlaying;
    }

    public get interval():number{
        if(this._animation){
            return this._animation.interval;
        }else{
            return Config.animationInterval;
        }
    }

    public set interval(value:number){
        if(this._animation){
            this._animation.interval = value;
        }
    }

    /**
     *  MovieClip 实例中帧的总数。
     */
    public get totalFrames(): number {
        return this._animation.count;
    }

    /**
     * 指定播放头在 MovieClip 实例的时间轴中所处的帧的编号。
     */
    public get currentFrame(): number {
        return this._animation.index + 1;
    }

    /**
     * MovieClip 实例的时间轴中当前帧上的标签。
     */
    public get currentFrameLabel(): string {
        for (let frameLabel of this._currentMovieData.frameLabels) {
            if (frameLabel.frame == this.currentFrame) {
                return frameLabel.name;
            }
        }
        return null;
    }

    /**
     * 返回由当前场景的 FrameLabel 对象组成的数组。
     */
    public get currentLabels(): FrameLabel[] {
        return this._currentMovieData.frameLabels;
    }

    /**
     * 在影片剪辑的时间轴中移动播放头。
     */
    public play(): void {
        if(this._animation)this._animation.play(this._animation.index);
    }

    /**
     * 停止影片剪辑中的播放头。
     */
    public stop(): void {
        if(this._animation)this._animation.stop();
    }

    /**
     * 从指定帧开始播放文件。
     */
    public gotoAndPlay(frame: number | string, movie: string = null): void {
        this.resetMovie(movie);
        if(this._animation)this._animation.play(this.getFrameIndex(frame), true);
    }

    /**
     * 将播放头移到影片剪辑的指定帧并停在那里。
     */
    public gotoAndStop(frame: number | string, movie: string = null): void {
        this.resetMovie(movie);
        if(this._animation)this._animation.gotoAndStop(this.getFrameIndex(frame));
    }

    /**
     * 将播放头转到下一帧并停止。
     */
    public nextFrame(): void {
        let frame = this.currentFrame + 1;
        if (frame > this.totalFrames) {
            frame = this.totalFrames;
        }
        this.gotoAndStop(frame);
    }

    /**
     * 将播放头转到前一帧并停止。
     */
    public prevFrame(): void {
        let frame = this.currentFrame - 1;
        if (frame < 1) {
            frame = 1;
        }
        this.gotoAndStop(frame);
    }

    /**
     * 添加帧脚本
     * @param parameters frameIndex1,callback1,frameIndex2,callback2……
     */
    public addFrameScript(...parameters): void {
        let pairs = parameters.length / 2;
        for (let i = 0; i < pairs; i++) {
            let frameIndex: number = parameters[i * 2];
            if (frameIndex >= this.totalFrames || frameIndex < 0) {
                continue;
            }
            this._animation.removeLabel(this.getDefaultLabel(frameIndex));
            let callback: Function | Handler = parameters[i * 2 + 1];
            if (callback == null) {
                delete this._frameScripts[frameIndex];
            } else {
                this._frameScripts[frameIndex] = callback;
                this._animation.addLabel(this.getDefaultLabel(frameIndex), frameIndex);
                if (this._animation.index == frameIndex) {
                    this.applyCallback(callback);
                }
            }
        }
    }

    /**
     * 通过帧标签获取帧数
     * @param label
     */
    public getFrameByLabel(label: string): number {
        for (let frameLabel of this._currentMovieData.frameLabels) {
            if (frameLabel.name == label) {
                return frameLabel.frame;
            }
        }
        return 0;
    }

    /**
     * 所有动画名字
     */
    public get movies(): string[] {
        let movies: string[] = [];
        for (let data of this._movieDatas) {
            movies.push(data.name);
        }
        return movies;
    }

    /**
     * 清除所有帧监听
     */
    public clearframeScripts(): void {
        this._frameScripts = {};
    }

    public reset(): void {
        if (!this._animation) {
            this._currentMovieData = null;
            this._animation = new Animation();
            this._animation.on(Event.LABEL, this, this.onLabel);
            if (this.movies.indexOf(MovieClip.DEFAULT_MOVIE) != -1) {//包含"mc"动画
                this.gotoAndStop(1, MovieClip.DEFAULT_MOVIE);
            }else{
                this.gotoAndStop(1);
            }
            this.addChild(this._animation);
            this.once(Event.REMOVED, this, this.onRemoved);
        }
    }

    private initData(): void {
        let data = Loader.getRes(this._url);
        if (data == null) {
            throw new Error("MovieClip:" + this._url + " is null!");
        }
        let movies: Object = data["movies"];
        let frames: Object = data["frames"];
        if (movies == null) {
            movies = { "mc": { "pivotX": 0, "pivotY": 0 } };
        }
        for (let key in movies) {
            let obj: Object = movies[key];
            let frame: Object = frames[key + "0000"]["frame"];
            let urls = this.getImageUrls(frames, key);
            this._movieDatas.push(new MovieData(key, urls, frame["w"], frame["h"], obj["pivotX"], obj["pivotY"], obj["labels"]));
        }
    }

    private onRemoved(): void {
        this._animation.off(Event.LABEL, this, this.onLabel);
        this._animation.clear();
        this._animation = null;
    }

    private onLabel(label: string): void {
        let frameIndex = parseInt(label.split("_")[1]);
        let callback = this._frameScripts[frameIndex];
        this.applyCallback(callback);
    }

    private getFrameIndex(frame: number | string): number {
        if (typeof frame === "string") {
            frame = this.getFrameByLabel(frame);
        }
        if (frame < 1) {
            frame = 1;
        } else if (frame > this.totalFrames) {
            frame = this.totalFrames;
        }
        return frame - 1;
    }

    private getDefaultLabel(frameIndex: number): string {
        return "label_" + frameIndex;
    }

    private resetMovie(movie: string): void {
        if (movie != null && (this._currentMovieData == null || this._currentMovieData.name != movie)) {
            for (let data of this._movieDatas) {
                if (data.name == movie) {
                    this._currentMovieData = data;
                    this.clearframeScripts();
                    this._animation.loadImages(data.urls);
                    this._animation.removeLabel(null);
                    let pivotX:number = data["pivotX"] || 0;
                    let pivotY:number = data["pivotY"] || 0;
                    this.pivot(pivotX, pivotY);
                    let width:number = data["width"] || 0;
                    let height:number = data["height"] || 0;
                    this.size(width, height);
                    break;
                }
            }
        }
    }

    private getImageUrls(frames: Object, movie: string): string[] {
        let urls = [];
        let index = 0;
        let getKey = (): string => {
            let str = index.toString();
            while (str.length < 4) {
                str = "0" + str;
            }
            return movie + str;
        };

        let key = getKey();
        while (frames.hasOwnProperty(key)) {
            urls.push(this._url.replace(/.json|.fmv/, "") + "/" + key);
            index++;
            key = getKey();
        }
        return urls;
    }

    private applyCallback(callback: Function | Handler): void {
        if (callback) {
            if (callback instanceof Handler) {
                callback.run();
            } else {
                callback();
            }
        }
    }
}