import Loading from "../Loading";
import GameConfig from "../../GameConfig";
import DisplayUtil from "../../util/DisplayUtil";
import DialogManager from "../dialog/DialogManager";
import InteractUtil from "../../util/InteractUtil";
import Loader from "../../loader/Loader";
import {AlignType} from "../AlignType";
import ClickHelper from "./ClickHelper";
import CommonRes from "../../config/CommonRes";
import Handler = Laya.Handler;
import Templet = Laya.Templet;
import Skeleton = Laya.Skeleton;
import Button = Laya.Button;
import Box = Laya.Box;
import Sprite = Laya.Sprite;

/**
 * Spine动画工具类
 * 动画的注册点在中心，尺寸固定800*480
 */
export default class SpineHelper {

    public static readonly DEFAULT_PREFIX:string = "spine/";
    public static readonly DEFAULT_SUFFIX:string = "/skeleton.sk";

    /**
     * 播放Spine全屏动画
     */
    public static playMovie(url:string, callback: Function = null, lockScreen:boolean = true,
                            prefix:string = SpineHelper.DEFAULT_PREFIX, suffix:string = SpineHelper.DEFAULT_SUFFIX):void
    {
        url = prefix + url + suffix;
        if(lockScreen)Loading.show();
        SpineHelper.getSkeleton(url, (skeleton:Skeleton)=>{
            if(lockScreen)Loading.close();
            let container:Box = SpineHelper.getContainer(skeleton);
            DialogManager.instance.addDialog(container, AlignType.NONE);
            skeleton.once(Laya.Event.STOPPED, this, ()=>{
                DialogManager.instance.removeDialog(container);
                InteractUtil.applyCallback(callback);
                Loader.clearRes(url.replace(".sk", ".png"));
                Loader.clearRes(url);//释放不了，有空研究
            });
            skeleton.play(skeleton.getAniNameByIndex(0), false);
        });
    }

    /**
     * 播放Spine漫画
     */
    public static playComic(url:string, callback: Function, lockScreen:boolean = true,
                            prefix:string = SpineHelper.DEFAULT_PREFIX, suffix:string = SpineHelper.DEFAULT_SUFFIX):void
    {
        url = prefix + url + suffix;
        if(lockScreen)Loading.show();
        Loader.load("common/comic.atlas", Handler.create(this, ()=>{
            SpineHelper.getSkeleton(url, (skeleton:Skeleton)=>{
                if(lockScreen)Loading.close();
                let container:Box = SpineHelper.getContainer(skeleton);
                DialogManager.instance.addDialog(container, AlignType.NONE);
                let btnPrev:Button = new Button("common/comic/btn_prev.png");
                btnPrev.stateNum = 2;
                btnPrev.name = "btnPrev";
                container.addChild(btnPrev);
                let btnNext:Button = new Button("common/comic/btn_next.png");
                btnNext.stateNum = 2;
                btnNext.name = "btnNext";
                container.addChild(btnNext);
                let btnClose:Button = new Button("common/comic/btn_close.png");
                btnClose.stateNum = 2;
                btnClose.name = "btnClose";
                container.addChild(btnClose);
                btnPrev.left = btnPrev.bottom = btnNext.right = btnNext.bottom = btnClose.right = btnClose.bottom = 20;
                let page = 1;
                let play = ()=>{
                    btnPrev.visible = false;
                    btnNext.visible = false;
                    btnClose.visible = false;
                    skeleton.play(skeleton.getAniNameByIndex(page - 1), false);
                };
                let stop = ()=>{
                    btnPrev.visible = page > 1;
                    btnNext.visible = page < skeleton.getAnimNum();
                    btnClose.visible = page == skeleton.getAnimNum();
                };
                let clickHelper:ClickHelper = new ClickHelper(container);
                clickHelper.regClickFunc(btnPrev.name, ()=>{
                    page--;
                    play();
                }, this);
                clickHelper.regClickFunc(btnNext.name, ()=>{
                    page++;
                    play();
                }, this);
                clickHelper.regClickFunc(btnClose.name, ()=>{
                    clickHelper.dispose();
                    skeleton.off(Laya.Event.STOPPED, this, stop);
                    DialogManager.instance.removeDialog(container);
                    InteractUtil.applyCallback(callback);
                    Loader.clearRes(url.replace(".sk", ".png"));
                    Loader.clearRes(url);//释放不了，有空研究
                }, this);
                skeleton.on(Laya.Event.STOPPED, this, stop);
                play();
            });
        }), null, Loader.ATLAS);
    }

    public static playGuideMovie(url:string, callback: Function, spGuide:Sprite, lockScreen:boolean = true, prefix:string = SpineHelper.DEFAULT_PREFIX, suffix:string = SpineHelper.DEFAULT_SUFFIX):void{
        url = prefix + url + suffix;
        if(lockScreen)Loading.show();
        SpineHelper.getSkeleton(url, (skeleton:Skeleton)=>{
            if(lockScreen)Loading.close();
            let container = SpineHelper.getContainer(skeleton);
            DialogManager.instance.addDialog(container, AlignType.NONE);
            skeleton.once(Laya.Event.STOPPED, this, ()=>{
                skeleton.addChild(spGuide);
                skeleton.once(Laya.Event.CLICK, this, ()=>{
                    spGuide.removeSelf();
                    skeleton.once(Laya.Event.STOPPED, this, ()=>{
                        DialogManager.instance.removeDialog(container);
                        InteractUtil.applyCallback(callback);
                    });
                    skeleton.play(skeleton.getAniNameByIndex(1), false);
                });
            });
            skeleton.play(skeleton.getAniNameByIndex(0), false);
        });
    }

    public static getSkeleton(url:string, callback:Function):void
    {
        let templet:Templet = new Templet();
        templet.once(Laya.Event.COMPLETE, this, ()=>{
            let skeleton = templet.buildArmature(0);
            skeleton.size(GameConfig.width, GameConfig.height);
            skeleton.scrollRect = new Laya.Rectangle(-GameConfig.width/2, -GameConfig.height/2, GameConfig.width, GameConfig.height);
            callback(skeleton);
        });
        templet.loadAni(url);
    }

    public static getContainer(skeleton:Skeleton):Box{
        let container:Box = new Box();
        let black:Sprite = Sprite.fromImage(CommonRes.URL_IMG_BLACK);
        container.addChild(black);
        container.addChild(skeleton);
        let onStageResize = ()=>{
            if (skeleton.width > Laya.stage.width) {
                let scale = Laya.stage.width / skeleton.width;
                skeleton.scale(scale, scale);
            }else{
                skeleton.scale(1, 1);
            }
            DisplayUtil.stretch(container);
            DisplayUtil.stretch(black);
            DisplayUtil.align(skeleton);
        };
        container.once(Laya.Event.REMOVED, null, ()=>{
            Laya.stage.off(Laya.Event.RESIZE, null, onStageResize);
        });
        Laya.stage.on(Laya.Event.RESIZE, null, onStageResize);
        onStageResize();
        return container;
    }

    public static drawRectGuide(width:number, height:number, posX:number, posY:number):Sprite
    {
        let sp = new Sprite();
        sp.graphics.drawRect(0, 0, width, height, "#FF0000");
        sp.alpha = 0;
        sp.size(width, height);
        sp.pos(posX, posY);
        return sp;
    }

    public static drawCircleGuide(radius:number, posX:number, posY:number):Sprite
    {
        let sp = new Sprite();
        sp.graphics.drawCircle(0, 0, radius, "#000000");
        sp.alpha = 0;
        sp.size(radius*2, radius*2);
        sp.pos(posX, posY);
        return sp;
    }
}