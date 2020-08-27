import Loader from '../../loader/Loader';
import StringUtil from '../../util/StringUtil';
import DisplayUtil from '../../util/DisplayUtil';
import Sprite = Laya.Sprite;
import View = Laya.View;
import Text = Laya.Text;
import Image = Laya.Image;

export default class TipsInfo {
    public static readonly URL_COMMON_TIPS = "common/tips/CommonTips.json";
    private _tips: Sprite;
    private _scaleX: number = 1;
    private _scaleY: number = 1;

    public constructor(content: string | Sprite, title: string = null) {
        if (content instanceof Sprite) {
            this._tips = content;
            this._scaleX = content.scaleX;
            this._scaleY = content.scaleY;
        } else {
            this._tips = this.createCommonTips(content, title);
        }
    }

    public get tips(): Sprite {
        return this._tips;
    }

    public get scaleX(): number {
        return this._scaleX;
    }

    public get scaleY(): number {
        return this._scaleY;
    }

    private createCommonTips(content: string, title: string): Sprite {
        content = content.replace(/</g,"&lt;");
        content = content.replace(/>/g,"&gt;");
        content = content.replace(/\"/g,"&quot;");
        content = content.replace(/\n/g,"<br>");
        let tips = new View();
        tips.createView(Loader.getRes(TipsInfo.URL_COMMON_TIPS));
        let txtTitle: Text = tips.getChildByName("txtTitle") as Text;
        let txtContent: Text = tips.getChildByName("txtContent") as Text;
        let txtHtmlTitle = DisplayUtil.createHtmlText(txtTitle);
        let txtHtmlContent = DisplayUtil.createHtmlText(txtContent);
        if (StringUtil.isNullOrEmpty(title)) {
            txtHtmlContent.y = txtHtmlTitle.y;
        } else {
            txtHtmlTitle.innerHTML = title;
        }
        txtHtmlContent.innerHTML = content;
        txtTitle.parent.addChild(txtHtmlTitle);
        txtContent.parent.addChild(txtHtmlContent);
        let imgBg = tips.getChildByName("imgBg") as Image;
        imgBg.width = Math.max(Math.max(txtHtmlTitle.contextWidth, txtHtmlContent.contextWidth) + 22, 77);
        imgBg.height = txtHtmlTitle.contextHeight + txtHtmlContent.contextHeight + 33;
        tips.size(imgBg.width, imgBg.height);
        txtTitle.removeSelf();
        txtContent.removeSelf();
        return tips;
    }
}