export default class Text
{
    //============== 全角转半角 ==============
    public static SBCtoDBC(s:string):string
    {
        var str:string = "";
        var strlen:number = s.length;
        for (var i:number = 0; i < strlen; i++)
        {
            var c:number = s.charCodeAt(i);
            if (c == 12288)
            {
                str += String.fromCharCode(32);
            }
            else if (c == 12290)
            {
                str += String.fromCharCode(46);
            }
            else if (c > 65280 && c < 65375)
            {
                str += String.fromCharCode(c - 65248);
            }
            else
                str += String.fromCharCode(c);
        }
        return str;
    }


    //获得字符串长度，双字节字符算两个字符
    public static getLength(s:string):number
    {
        var len:number = s.length;
        var strlen:number = s.length;
        for (var i:number = 0; i < strlen; i++)
        {
            if (s.charCodeAt(i) >= 255)
            {
                len++;
            }
        }
        return len;
    }
}