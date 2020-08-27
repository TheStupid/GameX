export default class StringUtil {

    public constructor() {
    }

    public static isNullOrEmpty(input: string): boolean {
        return input == null || input.length == 0;
    }

    public static split2IntegerArray(input: string, delim: string = ","): number[] {
        let result: number[] = [];
        if (StringUtil.isNullOrEmpty(input)) {
            return result;
        }
        let values: string[] = input.split(delim);
        for (let item of values) {
            result.push(parseInt(item));
        }
        return result;
    }

    public static replaceAll(input: string, regex: string, replacement: string): string {
        if (StringUtil.isNullOrEmpty(input)) {
            return "";
        }
        return input.split(regex).join(replacement);
    }


    /**
     * 将对象格式为字符串， 与Java的String.format类似，示例：
     * @param pattern 格式化的样式 ，%*范围1~9。例如"name:%1, id:%2"，此时params应有两个参数
     * @param params 需要格式化成字符串的对象，要与pattern的%个数一致
     * @return 格式化结果
     *
     */
    public static formatInOrder(pattern: string, ...params): string {
        var output: string = pattern.concat();
        for (var i: number = params.length - 1; i >= 0; i--) {
            var regX: RegExp = new RegExp("%" + (i + 1), "g");
            output = output.replace(regX, params[i].toString());
        }
        return output;
    }

    /**
     * 去掉字符串前后空格
     * @author ligenhao
     * @static
     * @param {string} input
     * @returns {string}
     * @memberof StringUtil
     */
    public static trim(input: string): string {
        return input.replace(/(^\s*)|(\s*$)/g, "");
    }

    public static SBCtoDBC(s: string): string {
        let str: string = "";
        let strlen: number = s.length;
        for (let i: number = 0; i < strlen; i++) {
            let c: number = s.charCodeAt(i);
            if (c == 12288) {
                str += String.fromCharCode(32);
            } else if (c == 12290) {
                str += String.fromCharCode(46);
            } else if (c > 65280 && c < 65375) {
                str += String.fromCharCode(c - 65248);
            } else
                str += String.fromCharCode(c);
        }
        return str;
    }

    public static getString(s: string): string {
        return this.trim(this.SBCtoDBC(s));
    }

    //获得字符串长度，双字节字符算两个字符
    public static getLength(s: string): number {
        let len: number = s.length;
        let strlen: number = s.length;
        for (let i: number = 0; i < strlen; i++) {
            if (s.charCodeAt(i) >= 255) {
                len++;
            }
        }
        return len;
    }

    private static readonly C_A: number = 65;
    private static readonly C_Z: number = 90;
    private static readonly C_a: number = 97;
    private static readonly C_z: number = 98;

    /**
     * 把字母字符串解析为整型数组（小写字母代表负数，大写字母代表正数，0还是0，如"a0A"->[-1, 0, 1]）
     * @author ligenhao
     * @static
     * @param {string} input
     * @returns {number[]}
     * @memberof StringUtil
     */
    public static parseLetters(input: string): number[] {
        let result: number[] = [];
        if (StringUtil.isNullOrEmpty(input)) {
            return result;
        }
        for (let i = 0; i < input.length; i++) {
            let code: number = input.charCodeAt(i);
            if (code >= StringUtil.C_A && code <= StringUtil.C_Z) {//大写字母
                result.push(code - StringUtil.C_A + 1);
            } else if (code >= StringUtil.C_a && code <= StringUtil.C_z) {//小写字母
                result.push(-(code - StringUtil.C_a + 1));
            } else {
                result.push(0);
            }
        }
        return result;
    }

    /**
     * 把数字转换为加密字母
     * @author ligenhao
     * @static
     * @param {number} num
     * @returns {string}
     * @memberof StringUtil
     */
    public static toLetter(num: number): string {
        if (num > 0) {
            return String.fromCharCode(StringUtil.C_A + num - 1);
        } else if (num < 0) {
            return String.fromCharCode(StringUtil.C_a - num - 1);
        }
        return "0";
    }

    /**
     * 格式化字符串
     * @author ligenhao
     * @static
     * @param {string} input
     * @param {any} args
     * @returns {string}
     * @memberof StringUtil
     */
    public static format(input: string, ...args): string {
        for (let value of args) {
            if (typeof value === "string") {
                input = input.replace("%s", value);
            } else if (typeof value === "number") {
                if (String(value).indexOf(".") != -1) {
                    input = input.replace("%f", String(value));
                } else {
                    input = input.replace("%d", String(value));
                }
            }
        }
        return input;
    }

    private static readonly OPERATORS: string[] = ["*", "/", "+", "-"];
    private static readonly BRACKETS: string[] = ["(", ")"];

    private static computeStringWithoutBracket(noBracketString: string): number {
        var numsStack: number[] = [];
        var operatorsStack: string[] = [];
        if (noBracketString.charAt(0) != "-") {
            noBracketString = "+" + noBracketString;
        }
        var operatorIndexs: number[] = [];
        for (var i = 0; i < noBracketString.length; i++) {
            var char = noBracketString.charAt(i);
            if (StringUtil.OPERATORS.indexOf(char) != -1) {
                operatorIndexs.push(i);
                operatorsStack.push(char);
            }
        }
        var numChar;
        for (var j = 1; j < operatorIndexs.length; j++) {
            numChar = noBracketString.substring(operatorIndexs[j - 1] + 1, operatorIndexs[j]);
            numsStack.push(parseFloat(numChar));
        }
        numChar = noBracketString.substring(operatorIndexs[operatorIndexs.length - 1] + 1);
        numsStack.push(parseFloat(numChar));
        if (operatorsStack[0] == "-") {
            numsStack[0] = -numsStack[0];
        }
        operatorsStack.shift();
        var multiplyIdx = operatorsStack.indexOf("*");
        var divisionIdx = operatorsStack.indexOf("/");
        while (multiplyIdx != -1 || divisionIdx != -1) {
            if (multiplyIdx != -1 && divisionIdx != -1) {
                if (multiplyIdx < divisionIdx) {
                    this.doCalculate(numsStack, operatorsStack, multiplyIdx);
                    divisionIdx = operatorsStack.indexOf("/");
                    this.doCalculate(numsStack, operatorsStack, divisionIdx);

                } else {
                    this.doCalculate(numsStack, operatorsStack, divisionIdx);
                    multiplyIdx = operatorsStack.indexOf("*");
                    this.doCalculate(numsStack, operatorsStack, multiplyIdx);
                }
            } else if (multiplyIdx != -1) {
                this.doCalculate(numsStack, operatorsStack, multiplyIdx);
            } else {
                this.doCalculate(numsStack, operatorsStack, divisionIdx);
            }
            multiplyIdx = operatorsStack.indexOf("*");
            divisionIdx = operatorsStack.indexOf("/");
        }
        var addIdx = operatorsStack.indexOf("+");
        var minusIdx = operatorsStack.indexOf("-");
        while (addIdx != -1 || minusIdx != -1) {
            if (addIdx != -1 && minusIdx != -1) {
                if (addIdx < minusIdx) {
                    this.doCalculate(numsStack, operatorsStack, addIdx);
                    minusIdx = operatorsStack.indexOf("-");
                    this.doCalculate(numsStack, operatorsStack, minusIdx);

                } else {
                    this.doCalculate(numsStack, operatorsStack, minusIdx);
                    addIdx = operatorsStack.indexOf("+");
                    this.doCalculate(numsStack, operatorsStack, addIdx);
                }
            } else if (addIdx != -1) {
                this.doCalculate(numsStack, operatorsStack, addIdx);
            } else {
                this.doCalculate(numsStack, operatorsStack, minusIdx);
            }
            addIdx = operatorsStack.indexOf("+");
            minusIdx = operatorsStack.indexOf("-");
        }
        return numsStack[0];
    }

    private static doCalculate(numsStack: number[], operatorsStack: string[], operatorIdx: number): void {
        var leftNum: number;
        var rightNum: number;
        var result: number;
        leftNum = numsStack.splice(operatorIdx, 1)[0];
        rightNum = numsStack.splice(operatorIdx, 1)[0];

        var operator = operatorsStack.splice(operatorIdx, 1)[0];
        switch (operator) {
            case "*": {
                result = leftNum * rightNum;
                break;
            }
            case "/": {
                result = leftNum / rightNum;
                break;
            }
            case "+": {
                result = leftNum + rightNum;
                break;
            }
            case "-": {
                result = leftNum - rightNum;
                break;
            }
        }
        numsStack.splice(operatorIdx, 0, result);
    }

    private static getNextBraketsIndex(input: string): any[] {
        var leftBracketAndRightBracketIndexs: any[] = [];
        var tmpIndexs: number[] = [];
        for (var i = 0; i < input.length; i++) {
            var char = input.charAt(i);
            if (char == "(") {
                tmpIndexs.push(i);
            } else if (char == ")") {
                leftBracketAndRightBracketIndexs.push([tmpIndexs.pop(), i]);
                break;
            }
        }
        return leftBracketAndRightBracketIndexs;
    }

    /**
     * calculate the input string like "((1-4)*4-2/5)*10" and return a number
     */
    public static computeString(input: string): number {
        var regexCheck: RegExp = new RegExp("[\\(\\)\\d\\+\\-\\*/\\.]*"); // 是否是合法的表达式
        if (input.match(regexCheck).length <= 0) {
            return 0;
        }
        var leftBracketAndRightBracketIndexs: any[] = [];
        leftBracketAndRightBracketIndexs = this.getNextBraketsIndex(input);
        var findLeftBracketIndex: number;
        var findRightBracketIndex: number;
        while (leftBracketAndRightBracketIndexs.length > 0) {
            var brackets: any[] = leftBracketAndRightBracketIndexs.shift();
            findLeftBracketIndex = brackets[0];
            findRightBracketIndex = brackets[1];
            var noBracketStr: string = input.substring(findLeftBracketIndex + 1, findRightBracketIndex);
            var tmpValue = this.computeStringWithoutBracket(noBracketStr);
            var leftRemainStr: string = input.substring(0, findLeftBracketIndex);
            var rightRemainStr: string = input.substring(findRightBracketIndex + 1);
            input = leftRemainStr + tmpValue + rightRemainStr;
            leftBracketAndRightBracketIndexs = this.getNextBraketsIndex(input);
        }
        return this.computeStringWithoutBracket(input);
    }

    public static toInt(s: string, radix?: number): number {
        if (StringUtil.isNullOrEmpty(s)) {
            return 0;
        }
        return parseInt(s, radix);
    }

    /**
     * 将num转为string，往前补0。
     * @param num
     * @param bitNum
     * @return
     */
    public static numToString(num: number, charNum: number): string {
        let numStr: string = num.toString();
        let needFillZeroBitNum: number = charNum - numStr.length;
        for (let i: number = 0; i < charNum; i++) {
            if (i < needFillZeroBitNum) {
                numStr = ("0" + numStr);
            }
        }
        return numStr;
    }
    /**
     * 字符串序列化。
     * @param targetArray 数组
     * @param separate 分隔符
     * @return
     */
    public static initArrayToString(targetArray: any[], separate: string): string {
        let result: string = "";
        for (let i: number = 0; i < targetArray.length; i++) {
            result += targetArray[i].toString();
            if (i < targetArray.length - 1) {
                result += separate;
            }
        }
        return result;
    }
}