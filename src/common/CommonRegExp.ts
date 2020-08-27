export default class CommonRegExp {

    /**
     * 手机号
     */
    public static readonly PHONE_NUMBER:RegExp = /^1\d{10}$/;

    /**
     * 真实姓名
     */
    public static readonly REAL_NAME:RegExp = /^[a-zA-Z0-9_\u4e00-\u9fa5]{2,14}$/;

    /**
     * 身份证号
     */
    public static readonly ID_NUMBER:RegExp = /^[0-9]{17}[0-9xX]{1}$/;

    /**
     * 密码
     */
    public static readonly PASSWORD:RegExp = /^[a-zA-Z0-9]{6,16}$/;

    /**
     * 多多号
     */
    public static readonly DUO_DUO_ID:RegExp = /^[0-9]{5,10}$/;

    /**
     * 邮箱
     */
    public static readonly EMAIL:RegExp = /\w+([-_.]\w+)*@\w+([-_.]\w+)*\.\w+([-_.]\w+)*/;
}