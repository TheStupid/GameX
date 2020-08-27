import {AlignType} from "../common/AlignType";
import MovieClip from '../flash/display/MovieClip';
import GameConfig from '../GameConfig';
import HTMLDivElement = Laya.HTMLDivElement;
import UIComponent = Laya.UIComponent;
import Rectangle = Laya.Rectangle;
import Sprite = Laya.Sprite;
import Text = Laya.Text;
import ColorFilter = Laya.ColorFilter;

export default class DisplayUtil {

	public static clearContainer(container: Sprite): void {
		if (container) {
            if (container.destroyed) {
                return;
            }
			while (container.numChildren > 0) {
				DisplayUtil.stopAndRemove(container.getChildAt(0) as Sprite);
			}
		}
	}

	public static stopAndRemove(target: Sprite, destroyChild:boolean=false): void {
		if (target) {
			if (target instanceof MovieClip || target instanceof Laya.Animation) {
				target.stop();
			}
			for (let i = 0; i < target.numChildren; i++) {
				DisplayUtil.dispatchRemoved(target.getChildAt(i) as Sprite);
			}
			if (destroyChild) {
                target.destroy(true);
            } else {
                target.removeSelf();
            }
		}
	}

	public static applyGray(target: Sprite): void {
		if (target instanceof UIComponent) {
			target.gray = true;
		} else {
			var colorMatrix = [
				0.3086, 0.6094, 0.0820, 0, 0,// red
				0.3086, 0.6094, 0.0820, 0, 0,// green
				0.3086, 0.6094, 0.0820, 0, 0,// blue
				0, 0, 0, 1, 0// alpha
			];
			var colorFlilter = new ColorFilter(colorMatrix);
			target.filters = [colorFlilter];
		}
	}

	/**
	  * 将显示对象的亮度调为-50
	  *
	  * @param	target	待调整亮度的显示对象
	  **/
	public static setBrightHalf(target: Sprite): void {
		var colorMatrix = [
			1, 0, 0, 0, -100,// red
			0, 1, 0, 0, -100,// green
			0, 0, 1, 0, -100,// blue
			0, 0, 0, 1, 0// alpha
		];
		var colorFlilter = new ColorFilter(colorMatrix);
		target.filters = [colorFlilter];
	}

    /**
     * 将显示对象的亮度调为50
     *
     * @param	target	待调整亮度的显示对象
     **/
    public static setBrightDouble(target: Sprite): void {
        var colorMatrix = [
            1, 0, 0, 0, 200,// red
            0, 1, 0, 0, 200,// green
            0, 0, 1, 0, 200,// blue
            0, 0, 0, 1, 0// alpha
        ];
        var colorFlilter = new ColorFilter(colorMatrix);
        target.filters = [colorFlilter];
    }

	public static clearFilters(target: Sprite): void {
		if (target instanceof UIComponent) {
			target.gray = false;
		}
		target.filters = null;
	}

	public static align(disObj: Sprite, alignType: AlignType = AlignType.MIDDLE_CENTER, bound: Rectangle = null): void {
		if (bound == null) {
			bound = new Rectangle(0, 0, Laya.stage.width, Laya.stage.height);
		}
		let width:number = disObj.width * Math.abs(disObj.scaleX);
		let height:number = disObj.height * Math.abs(disObj.scaleY);
		switch (alignType) {
			case AlignType.TOP_LEFT:
				disObj.x = bound.x;
				disObj.y = bound.y;
				break;
			case AlignType.TOP_CENTER:
				disObj.x = (bound.width >> 1) - (width >> 1);
				disObj.y = bound.y;
				break;
			case AlignType.TOP_RIGHT:
				disObj.x = bound.width - width;
				disObj.y = bound.y;
				break;
			case AlignType.MIDDLE_LEFT:
				disObj.x = bound.x;
				disObj.y = (bound.height >> 1) - (height >> 1);
				break;
			case AlignType.MIDDLE_CENTER:
                disObj.x = (bound.width >> 1) - (width >> 1);
                disObj.y = (bound.height >> 1) - (height >> 1);
				break;
			case AlignType.MIDDLE_RIGHT:
				disObj.x = bound.width - width;
				disObj.y = (bound.height >> 1) - (height >> 1);
				break;
			case AlignType.BOTTOM_LEFT:
				disObj.x = bound.x;
				disObj.y = bound.height - height;
				break;
			case AlignType.BOTTOM_CENTER:
				disObj.x = (bound.width >> 1) - (width >> 1);
				disObj.y = bound.height - height;
				break;
			case AlignType.BOTTOM_RIGHT:
				disObj.x = bound.width - width;
				disObj.y = bound.height - height;
				break;
			default:
				break;
		}
	}

	/**
	 * 缩放元件
	 * 当宽和高其中一个为0时，按传入的值等比缩放
	 * 当两个都传入时，按小的缩放
	 **/
	public static scaleDisplay(view: Sprite, appointWidth: number = 0, appointHeight: number = 0): void {
		if (appointWidth > 0 || appointHeight > 0) {
			var scale: number;
			if (appointWidth <= 0) {
				scale = appointHeight / view.height * view.scaleY;
			} else if (appointHeight <= 0) {
				scale = appointWidth / view.width * view.scaleX;
			} else {
				var scaleX = appointWidth / view.displayWidth;
				var scaleY = appointHeight / view.displayHeight;
				scale = Math.min(scaleX, scaleY);
			}
			view.scaleX = scale;
			view.scaleY = scale;
		}
	}

	/**
	 * 上下左右居中元件
	 * 元件必须有父亲
	 * 传入要居中的元件的在其父亲坐标系中的大小范围，设置元件的x,y达到居中，元件注册点可以在任意位置
	 * @param view
	 * @param containerWidth 元件居中范围的宽
	 * @param containerHeight　元件居中范围的高
	 */
	public static middleDisplay(view: Sprite, containerWidth: number, containerHeight: number): void {
		view.x = 0;
		view.y = 0;
		var r: Rectangle = view.getBounds();
		var regX: number = 0 - r.x;
		var regY: number = 0 - r.y;
		view.x = (containerWidth - view.width) / 2 + regX;
		view.y = (containerHeight - view.height) / 2 + regY;
	}

	/**
	 * @param view 把元件拉伸铺满舞台
	 */
	public static stretch(view: Sprite): void {
		if (view) {
			view.size(Laya.stage.width, Laya.stage.height);
		}
	}

	/**
	 * 是否横屏
	 */
	public static get isHorizontal(): boolean {
		return Laya.Browser.clientWidth > Laya.Browser.clientHeight;
	}

	/**
	 * 切换屏幕方向
	 * @param isHorizontal 是否水平
	 */
	public static changeOrientation(isHorizontal: boolean): void {
		let stageWidth = isHorizontal ? GameConfig.width : GameConfig.height;
		let stageHeight = isHorizontal ? GameConfig.height : GameConfig.width;
		Laya.stage.scaleMode = isHorizontal ? Laya.Stage.SCALE_FIXED_HEIGHT : Laya.Stage.SCALE_FIXED_WIDTH;
		Laya.stage.screenMode = isHorizontal ? Laya.Stage.SCREEN_HORIZONTAL : Laya.Stage.SCREEN_VERTICAL;
	}

	/**
	 * 通过普通文本创建Html文本
	 * @author ligenhao
	 * @static
	 * @param {Text} text 
	 * @returns {HTMLDivElement} 
	 * @memberof DisplayUtil
	 */
	public static createHtmlText(text: Text): HTMLDivElement {
		var htmlText = new HTMLDivElement();
		htmlText.x = text.x;
		htmlText.y = text.y + 10;
		htmlText.style.width = text.width;
		htmlText.style.height = text.height;
		htmlText.style.font = text.font;
		htmlText.style.align = text.align;
		htmlText.style.valign = text.valign;//valign无效
		htmlText.style.color = text.color;
		htmlText.style.fontSize = text.fontSize;
		htmlText.style.wordWrap = text.wordWrap;
		htmlText.style.leading = text.leading;
		htmlText.style.padding = text.padding;
		htmlText.scale(text.scaleX, text.scaleY);
		return htmlText;
	}

	public static setPivot(source: Sprite, target: Sprite = null): void {
		if (source) {
			let pivot = source.getChildByName("pivot") as Sprite;
			if (pivot) {
				if (!target) target = source;
				target.pivot(pivot.x, pivot.y);
			}
		}
	}

	private static readonly RED_DOT = "red_dot";

	/**
	 * 添加红点
	 */
	public static addRedDot(target: Sprite, x: number = 0, y: number = 0): void {
		if (target) {
			let spRedDot = target.getChildByName(DisplayUtil.RED_DOT) as Sprite;
			if (!spRedDot) {
				spRedDot = Sprite.fromImage("common/res/img_reddot.png");
				spRedDot.name = DisplayUtil.RED_DOT;
				spRedDot.pos(x, y);
                target.addChild(spRedDot);
			}
		}
	}

	/**
	 * 移除红点
	 */
	public static removeRedDot(target: Sprite): void {
		if (target) {
			let spRedDot = target.getChildByName(DisplayUtil.RED_DOT) as Sprite;
			if (spRedDot) {
				spRedDot.removeSelf();
			}
		}
	}

	private static dispatchRemoved(target: Sprite): void {
		if (target) {
			for (var i = 0; i < target.numChildren; i++) {
				DisplayUtil.dispatchRemoved(target.getChildAt(i) as Sprite);
			}
			target.event(Laya.Event.REMOVED);
		}
	}
}