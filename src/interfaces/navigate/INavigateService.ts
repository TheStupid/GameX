import IService from '../IService'

export default interface INavigateService extends IService {
    /**
     * 开通VIP页面
     *
     * @param callback: 由20140829开始，跳转之后弹个对话框，问是否完成充值，callback 在关了对话框之后回调
     * @param filter function(srcUrl:String):String
     * @param buddyDuoduoId 赠送VIP好友多多号
     */
    goToVip(needTipsDialog?: boolean,
            callback?: Function,
            filter?: Function,
            buddyDuoduoId?: string): void
}
