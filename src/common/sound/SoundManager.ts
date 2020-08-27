import EventDispatcher from '../../egret/events/EventDispatcher';
import UserInfo from '../user/UserInfo';
import LocalCache from '../cache/LocalCache';
import SoundManagerEvent from './SoundManagerEvent';

/**
 * 管理声音开关和背景音乐
 * */
export default class SoundManager extends EventDispatcher {
    private static readonly soundName: string = "u_s";

    private static _instance: SoundManager;
    private fileName: string;
    private closeSound: boolean;

    public static get instance(): SoundManager {
        if (SoundManager._instance == null) {
            SoundManager._instance = new SoundManager();
        }
        return SoundManager._instance;
    }

    /**
     * 是否关闭音效
     * */
    public get isClose(): boolean {
        return this.closeSound;
    }

    public get currentMusic(): string {
        return this.fileName;
    }

    private constructor() {
        super();
        var obj: Object = LocalCache.getValue(UserInfo.account, SoundManager.soundName);
        if (obj != null) {
            this.closeSound = Boolean(obj);
        } else {
            this.closeSound = false;
        }
        Laya.SoundManager.useAudioMusic = true;
    }

    /**
     * 播放背景音乐，自动循环播放
     * 只可存在一个，每次播放，只要不是同一个，关闭上次的。
     * */
    public playBackgroundMusic(file: string, volume: number = 1, loop: boolean = true): void {
        if (this.isClose) {
            return;
        }
        if (file == null) {
            this.stopBackgroundMusic();
            return;
        }
        //如果正在播当前音乐，则返回
        if (file == this.fileName) {
            return;
        }
        this.fileName = file;
        try{
            Laya.SoundManager.playMusic(file, 0)
        }catch (e) {

        }
    }

    /**
     * 停止当前音乐
     * */
    public stopBackgroundMusic(): void {
        this.fileName = null;
        try{
            Laya.SoundManager.stopMusic();
        }catch (e) {

        }
    }

    /**
     * 播放声音开关
     * @param    close    false=打开声音，true=关闭声音
     * */
    public switchMusic(close: boolean): void {
        LocalCache.setValue(UserInfo.account, close, SoundManager.soundName);
        this.closeSound = close;
        if (close) {
            this.stopBackgroundMusic();
        } else {
            this.dispatchEvent(new SoundManagerEvent(SoundManagerEvent.ON_SWITCH_ON));
        }
    }
}