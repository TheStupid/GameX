import DialogBackground from './DialogBackground';
import Dictionary from '../../util/Dictionary';
import LayerManager from '../../loader/layer/LayerManager';
import {AlignType} from '../AlignType';
import {PanelEffect} from './PanelEffect';
import DialogContainer from './DialogContainer';
import PanelEvent from './PanelEvent';
import DisplayUtil from '../../util/DisplayUtil';
import EventDispatcher from '../../egret/events/EventDispatcher';
import TipsManager from '../tips/TipsManager';
import Handler = Laya.Handler;
import Sprite = Laya.Sprite;
import Box = Laya.Box;

export default class DialogManager extends EventDispatcher {

    private static _instance: DialogManager;

    private _mcArrayMap: Dictionary<string, DialogContainer[]>;
    private readonly layerArray: string[] = [LayerManager.BASE_LAYER, LayerManager.FIGHTING_LAYER, LayerManager.MOVIE_LAYER];

    public constructor() {
        super();
        this._mcArrayMap = new Dictionary();
    }

    public static get instance(): DialogManager {
        if (DialogManager._instance == null) {
            DialogManager._instance = new DialogManager();
        }
        return DialogManager._instance;
    }

    public addDialog(window: Sprite, alignType: AlignType = AlignType.MIDDLE_CENTER, effect: PanelEffect = PanelEffect.NONE,
                     grayBackground: boolean = true, x: number = 0, y: number = 0, clickBackgroundRemove: boolean = false,
                     effectEnd: Handler = null, destroyChild: boolean = true): void {
        let layerSpriteArray: Box[] = [LayerManager.getBaseTop(), LayerManager.getFightingTop(), LayerManager.getMovieLayer()];
        if (this.getDialogContainer(window) != null) return;
        this.alignWindow(window, alignType, x, y);

        var currentLayer: string = LayerManager.getCurrentLayer();
        DialogBackground.getInstance().removeBackground(currentLayer, grayBackground);

        this.deactivateOtherWindow(currentLayer);

        let dialogContainer = new DialogContainer(window, currentLayer, grayBackground, clickBackgroundRemove, destroyChild);
        layerSpriteArray[this.layerArray.indexOf(currentLayer)].addChild(dialogContainer);

        var mcArray = this.mcArrayMapAddDialog(currentLayer, dialogContainer);
        if (mcArray.length == 1) {
            this.disableLayers();
        }
        dialogContainer.panelAdded();
        this.playWindowEffect(window, effect, effectEnd);
        TipsManager.getInstance().removeCurrentTips();
    }

    public removeDialog(window: Sprite, effect: PanelEffect = PanelEffect.FADE): void {
        var windowContainer: DialogContainer = this.getDialogContainer(window);
        if (windowContainer == null) return;

        var isInFront: boolean = this.removeFromMcArrayAndCheakIsInFront(windowContainer);

        var mcArray = this._mcArrayMap.getValue(windowContainer.layerName);
        windowContainer.dispose();

        this.activateOtherWindow(mcArray);

        if (mcArray.length != 0) {
            this.nextDialogAddBackground(isInFront, mcArray, windowContainer);
        } else {
            this.enableLayers();
        }
    }

    public clearAll(): void {
        this.dispatchEvent(new PanelEvent(PanelEvent.CLEAR_ALL_CALL));
        for (let layerName of this.layerArray) {
            var mcArray = this._mcArrayMap.getValue(layerName);
            if (mcArray != null) {
                for (let dialogContainer of mcArray) {
                    dialogContainer.dispose();
                }
            }
            mcArray = null;
        }
        this.enableLayers();
        this.dispose();
        this.dispatchEvent(new PanelEvent(PanelEvent.CLEAR_ALL_DONE));
    }

    public haveModalPanelInStage(): boolean {
        for (let layerName of this.layerArray) {
            var mcArray = this._mcArrayMap.getValue(layerName);
            if (mcArray != null && mcArray.length > 0) {
                return true;
            }
        }
        return false;
    }

    private getDialogContainer(window: Sprite): DialogContainer {
        for (let layerName of this.layerArray) {
            let mcArray = this._mcArrayMap.getValue(layerName);
            if (mcArray == null) {
                continue;
            }
            for (let dialogContainer of mcArray) {
                if (window == dialogContainer.mov) {
                    return dialogContainer;
                }
            }
        }
        return null;
    }

    private alignWindow(window: Sprite, alignType: AlignType, x: number, y: number): void {
        DisplayUtil.align(window, alignType);
        if (alignType == AlignType.NONE) {
            window.x = x;
            window.y = y;
        }
    }

    private deactivateOtherWindow(currentLayer: string): void {
        let mcArray = this._mcArrayMap.getValue(currentLayer);
        if (mcArray == null) {
            return;
        }
        for (let modalDialogContainer of mcArray) {
            modalDialogContainer.deactivate();
        }
    }

    private activateOtherWindow(mcArray: DialogContainer[]): void {
        if (mcArray.length < 1) {
            return;
        }
        var dialogContainer = mcArray[mcArray.length - 1];
        dialogContainer.activate();
    }

    private mcArrayMapAddDialog(currentLayer: string, dialogContainer: DialogContainer): DialogContainer[] {
        let mcArray = this._mcArrayMap.getValue(currentLayer);
        if (mcArray == null) {
            mcArray = [];
            this._mcArrayMap.setValue(currentLayer, mcArray);
        }
        mcArray.push(dialogContainer);
        return mcArray;
    }

    private disableLayers(): void {
        let layers = this.getLayers();
        for (let disObj of layers) {
            disObj.mouseEnabled = false;
        }
    }

    private enableLayers(): void {
        let layers = this.getAllLayers();
        for (let disObj of layers) {
            disObj.mouseEnabled = true;
        }
    }

    private getAllLayers(): Box[] {
        let layers: Box[] = [];
        layers.push(LayerManager.getBaseScene());
        layers.push(LayerManager.getBaseControl());
        layers.push(LayerManager.getBaseApp());
        layers.push(LayerManager.getBaseIcons());
        layers.push(LayerManager.getFightingScene());
        layers.push(LayerManager.getFightingControl());
        layers.push(LayerManager.getFightingTips());
        return layers;
    }

    private getLayers(): Box[] {
        let layers: Box[] = [];
        let currentLayer: string = LayerManager.getCurrentLayer();
        if (currentLayer == LayerManager.BASE_LAYER) {
            layers.push(LayerManager.getBaseScene());
            layers.push(LayerManager.getBaseControl());
            layers.push(LayerManager.getBaseApp());
            layers.push(LayerManager.getBaseIcons())
        } else if (currentLayer == LayerManager.FIGHTING_LAYER) {
            layers.push(LayerManager.getFightingScene());
            layers.push(LayerManager.getFightingControl());
            layers.push(LayerManager.getFightingTips());
        }
        return layers;
    }

    private removeFromMcArrayAndCheakIsInFront(windowContainer: DialogContainer): boolean {
        let layerName: string = windowContainer.layerName;
        let mcArray = this._mcArrayMap.getValue(layerName);
        let isInFront: boolean = false;
        if (mcArray != null) {
            let index: number = mcArray.indexOf(windowContainer);
            if (index != -1) {
                if (index == mcArray.length - 1) {
                    isInFront = true;
                }
                mcArray.splice(index, 1);
            } else {
                throw new Error("DialogManager.removeFromMcArrayAndCheakIsInFront error");
            }
        } else {
            throw new Error("DialogManager.removeFromMcArrayAndCheakIsInFront error null");
        }
        return isInFront;
    }

    private nextDialogAddBackground(isInFront: boolean, mcArray: DialogContainer[], currentContainer: DialogContainer): void {
        if (!isInFront) return;
        for (let i = mcArray.length - 1; i >= 0; i--) {
            let nextDialogContainer: DialogContainer = mcArray[i];
            if (nextDialogContainer.isGrayBackground == currentContainer.isGrayBackground) {
                nextDialogContainer.addBackground();
                break;
            }
        }
    }

    private playWindowEffect(window: Sprite, effect: PanelEffect, effectEnd: Handler): void {
        switch (effect) {
            case PanelEffect.NONE:
                if (effectEnd) effectEnd.run();
                break;
            case PanelEffect.POP:
                Laya.Tween.from(window, {
                    x: Laya.stage.width / 2,
                    y: Laya.stage.height / 2,
                    scaleX: 0,
                    scaleY: 0
                }, 300, Laya.Ease.backOut, effectEnd);
                break;
        }
    }

    private dispose(): void {
        this._mcArrayMap.clear();
        DialogBackground.getInstance().dispose();
    }
}