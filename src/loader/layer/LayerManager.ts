import Dictionary from '../../util/Dictionary';
import LayerInfo from './LayerInfo';
import {HangUpLevel} from './HangUpLevel';
import {BaseLayer} from './BaseLayer';
import {FightingLayer} from './FightingLayer';
import {MovieLayer} from './MovieLayer';
import LayerEvent from './LayerEvent';
import DisplayUtil from '../../util/DisplayUtil';
import EventDispatcher from '../../egret/events/EventDispatcher';
import Box = Laya.Box;
import Sprite = Laya.Sprite;

export default class LayerManager extends EventDispatcher {

	public static readonly instance: LayerManager = new LayerManager();

	public static readonly BASE_LAYER: string = "BaseLayer";
	public static readonly FIGHTING_LAYER: string = "FightingLayer";
	public static readonly MOVIE_LAYER: string = "MovieLayer";

	private static readonly LAYER_SUB_COUNT: Object = { "BaseLayer": 6, "FightingLayer": 4, "MovieLayer": 1 };
	private static readonly LAYER_SUB_START_INDEX: Object = { "BaseLayer": 4, "FightingLayer": 10, "MovieLayer": 14 };
	private static _stage: Sprite;
	private static _layers: Object = {};
	private static _currentLayer: string = LayerManager.FIGHTING_LAYER;
	private static _visibleMap: Dictionary<Box, boolean> = new Dictionary();
	private static _mouseEnabledMap: Object = {};

	private constructor() {
		super();
	}

	/**
	  * 初始化层次
	  */
	public static init(stage:Sprite): void {
		LayerManager._stage = stage;

		LayerManager._layers = {};
		LayerManager.initLayers(LayerManager.BASE_LAYER);
		LayerManager.initLayers(LayerManager.FIGHTING_LAYER);
		LayerManager.initLayers(LayerManager.MOVIE_LAYER);
		LayerManager.switchLayer(LayerManager.BASE_LAYER, HangUpLevel.DESTROY);

		Laya.stage.on(Laya.Event.RESIZE, null, LayerManager.onResize);
		LayerManager.onResize();
	}

	public static get stage(): Sprite {
		return LayerManager._stage;
	}

	public static getCurrentLayer(): string {
		return LayerManager._currentLayer;
	}

	public static getSubLayers(layerName: string): Box[] {
		return (<LayerInfo>LayerManager._layers[layerName]).subLayers;
	}

	public static getBaseScene(): Box {
		return LayerManager.getSubLayer(LayerManager.BASE_LAYER, BaseLayer.BASE_SCENE);
	}

	public static getBaseControl(): Box {
		return LayerManager.getSubLayer(LayerManager.BASE_LAYER, BaseLayer.BASE_CONTROL);
	}

	public static getBaseIcons(): Box {
		return LayerManager.getSubLayer(LayerManager.BASE_LAYER, BaseLayer.BASE_ICONS);
	}

	public static getBaseApp(): Box {
		return LayerManager.getSubLayer(LayerManager.BASE_LAYER, BaseLayer.BASE_APPS);
	}

	public static getBaseTips(): Box {
		return LayerManager.getSubLayer(LayerManager.BASE_LAYER, BaseLayer.BASE_TIPS);
	}

	public static getBaseTop(): Box {
		return LayerManager.getSubLayer(LayerManager.BASE_LAYER, BaseLayer.BASE_TOP);
	}

	public static getFightingScene(): Box {
		return LayerManager.getSubLayer(LayerManager.FIGHTING_LAYER, FightingLayer.FIGHTING_SCENE);
	}

	public static getFightingControl(): Box {
		return LayerManager.getSubLayer(LayerManager.FIGHTING_LAYER, FightingLayer.FIGHTING_CONTROL);
	}

	public static getFightingTips(): Box {
		return LayerManager.getSubLayer(LayerManager.FIGHTING_LAYER, FightingLayer.FIGHTING_TIPS);
	}

	public static getFightingTop(): Box {
		return LayerManager.getSubLayer(LayerManager.FIGHTING_LAYER, FightingLayer.FIGHTING_TOP);
	}

	public static getMovieLayer(): Box {
		return LayerManager.getSubLayer(LayerManager.MOVIE_LAYER, MovieLayer.MOVIE_PLAY);
	}

	public static switchLayer(layerName: string, hangUpLevel: HangUpLevel = HangUpLevel.HIDE): void {
		// 不需要层次切换
		if (layerName == LayerManager._currentLayer) {
			return;
		}

		// 确定当前激活的层次
		let currentLayer: LayerInfo = LayerManager._layers[LayerManager._currentLayer];
		let currentSubLayers: Box[] = currentLayer.subLayers;
		let i: number, len: number;

		// 挂起当前层次
		if (hangUpLevel == HangUpLevel.HIDE) {
			for (i = 0, len = currentSubLayers.length; i < len; i++) {
				var subLayer: Box = currentSubLayers[i];
				//存下将挂起层的可见性，以便恢复
				LayerManager._visibleMap.setValue(subLayer, subLayer.visible);
				subLayer.visible = false;
				subLayer.y += 1000;
			}
			LayerManager.instance.dispatchEvent(new LayerEvent(LayerEvent.HIDE, LayerManager._currentLayer));
		}
		else if (hangUpLevel == HangUpLevel.REMOVE) {
			for (i = 0, len = currentSubLayers.length; i < len; i++) {
				LayerManager._stage.removeChild(currentSubLayers[i]);
			}
			LayerManager.instance.dispatchEvent(new LayerEvent(LayerEvent.REMOVE, LayerManager._currentLayer));
		}
		else if (hangUpLevel == HangUpLevel.DESTROY) {
			for (i = 0, len = currentSubLayers.length; i < len; i++) {
				DisplayUtil.stopAndRemove(currentSubLayers[i]);
			}
			LayerManager.initLayers(LayerManager._currentLayer);
			LayerManager.instance.dispatchEvent(new LayerEvent(LayerEvent.DESTROY, LayerManager._currentLayer));
		}
		currentLayer.hangUpLevel = hangUpLevel;

		// 确定将要被激活的层次
		var newLayer: LayerInfo = LayerManager._layers[layerName];
		var newLayerArr: Box[] = newLayer.subLayers;
		if (newLayer.hangUpLevel == HangUpLevel.HIDE) {
			for (i = 0, len = newLayerArr.length; i < len; i++) {
				//恢复成原有的可见性
				newLayerArr[i].visible = LayerManager._visibleMap.getValue(newLayerArr[i]);
				newLayerArr[i].y -= 1000;
			}
			LayerManager.instance.dispatchEvent(new LayerEvent(LayerEvent.SHOW, layerName));
		} else if (newLayer.hangUpLevel == HangUpLevel.REMOVE || newLayer.hangUpLevel == HangUpLevel.DESTROY) {
			for (i = 0, len = newLayerArr.length; i < len; i++) {
				var startIndex: number = LayerManager.LAYER_SUB_START_INDEX[layerName];
				var index = startIndex + i;
				if (index < LayerManager._stage.numChildren - 1) {
					LayerManager._stage.addChildAt(newLayerArr[i], index);
				}
				else {
					LayerManager._stage.addChild(newLayerArr[i]);
				}
			}
			LayerManager.instance.dispatchEvent(new LayerEvent(LayerEvent.ADD, layerName));
		}

		newLayer.hangUpLevel = hangUpLevel;
		LayerManager._currentLayer = layerName;
	}

	public dispatchHide(): void {
		LayerManager.instance.dispatchEvent(new LayerEvent(LayerEvent.HIDE, LayerManager._currentLayer));
	}

	public dispatchShow(): void {
		LayerManager.instance.dispatchEvent(new LayerEvent(LayerEvent.SHOW, LayerManager._currentLayer));
	}

	private static initLayers(layerName: string): void {
		var layerInfo: LayerInfo = new LayerInfo();
		var subCount: number = LayerManager.LAYER_SUB_COUNT[layerName];
		for (let i: number = 0; i < subCount; i++) {
			var layer: Box = new Box();
			layer.mouseThrough = true;
			layer.name = layerName + "_c" + i;
			layerInfo.subLayers.push(layer);
		}
		LayerManager._layers[layerName] = layerInfo;
	}

	private static getSubLayer(layerName: string, subLayer: number): Box {
		return (<LayerInfo>LayerManager._layers[layerName]).subLayers[subLayer];
	}

	private static onResize(): void {
		DisplayUtil.stretch(LayerManager.getBaseScene());
		DisplayUtil.stretch(LayerManager.getBaseControl());
		DisplayUtil.stretch(LayerManager.getBaseIcons());
		DisplayUtil.stretch(LayerManager.getBaseApp());
		DisplayUtil.stretch(LayerManager.getBaseTips());
		DisplayUtil.stretch(LayerManager.getBaseTop());
		DisplayUtil.stretch(LayerManager.getFightingScene());
		DisplayUtil.stretch(LayerManager.getFightingControl());
		DisplayUtil.stretch(LayerManager.getFightingTips());
		DisplayUtil.stretch(LayerManager.getFightingTop());
		DisplayUtil.stretch(LayerManager.getMovieLayer());
	}
}