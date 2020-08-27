export default class ArrayUtil {

    /**
     * 排序方法为不区分大小写的排序。
     */
    public static readonly CASEINSENSITIVE: number = 1;

    /**
     * 排序方法为降序排序。
     */
    public static readonly DESCENDING: number = 2;

    /**
     * 排序方法为数值（而不是字符串）排序
     */
    public static readonly NUMERIC: number = 16;

    public static arrayContainsValue(arr: any[], value: Object): boolean {
        return (arr.indexOf(value) != -1);
    }

    public static removeValueFromArray(arr: any[], value: Object): void {
        var len = arr.length;
        for (var i = len; i > -1; i--) {
            if (arr[i] === value) {
                arr.splice(i, 1);
            }
        }
    }

    /**
     * 默认情况下，按以下方式进行排序：
     * ·排序区分大小写（Z 优先于 a）。
     * ·按升序排序（a 优先于 b）。
     * ·修改该数组以反映排序顺序；在排序后的数组中不按任何特定顺序连续放置具有相同排序字段的多个元素。
     * ·元素无论属于何种数据类型，都作为字符串进行排序，所以 100 在 99 之前，这是因为 "1" 的字符串值小于 "9" 的字符串值。
     * 如果要使用与默认设置不同的设置对数组进行排序，可以使用 ...args 参数说明中 sortOptions 部分所描述的某种排序选项，也可以创建自定义函数来进行排序。如果创建自定义函数，请调用 sort() 方法，并将自定义函数的名称作为第一个参数 (compareFunction)。
     */
    public static sort(arr: any[], ...args): any[] {
        let sortOptions: number;
        if (args && args.length > 0) {
            if (args[0] instanceof Function) {
                if (args.length > 1) {
                    sortOptions = args[1];
                }
                arr.sort((a, b): number => {
                    let result = args[0](a, b);
                    if ((sortOptions & ArrayUtil.DESCENDING) != 0) {//降序排序
                        result *= -1;
                    }
                    return result;
                });
                return;
            }
            sortOptions = args[0];
        }
        arr.sort((a, b): number => {
            return ArrayUtil.compare(a, b, sortOptions);
        });
        return arr;
    }

    public static sortOn(arr: any[], fieldName: string, sortOptions?: number): any[] {
        arr.sort((a, b): number => {
            return ArrayUtil.compare(a[fieldName], b[fieldName], sortOptions);
        });
        return arr;
    }

    /**
     * 数组随机排序
     */
    public static randomSort<T>(arr: Array<T>): void {
        arr.sort((a: T, b: T): number => {
            return Math.pow(-1, Math.floor(Math.random() * 2));
        });
    }

    public static createUniqueCopy<T>(a: Array<T>): Array<T> {
        var newArray: Array<T> = [];

        var len: Number = a.length;
        var item: T;

        for (var i: number = 0; i < len; ++i) {
            item = a[i];

            if (ArrayUtil.arrayContainsValue(newArray, item)) {
                continue;
            }

            newArray.push(item);
        }

        return newArray;
    }

    public static getRandomElement<T>(arr: Array<T>): T {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    private static compare(a: any, b: any, sortOptions?: number): number {
        if ((sortOptions & ArrayUtil.CASEINSENSITIVE) != 0) {//不区分大小写
            if (typeof a === "string") {
                a = a.toLocaleLowerCase();
            }
            if (typeof b === "string") {
                b = b.toLocaleLowerCase();
            }
        }
        let result = a > b ? 1 : (a < b ? -1 : 0);
        if ((sortOptions & ArrayUtil.DESCENDING) != 0) {//降序排序
            result *= -1;
        }
        return result;
    }

    public static copyArray(arr: any[]): any[] {
        return arr.slice();
    }
}