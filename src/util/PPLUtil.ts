import HanziToPinyinUtil from "./HanziToPinyinUtil";

export default class PPLUtil {
		/**
		 * 分词拆分后转成标准正则表达式
		 * @param input
		 * @return
		 * @example
		 * 		一二三ABC一二AB一C：[".*一二三.*一二.*一.*",".*A.*B.*C.*A.*B.*C.*"]
		 * 		ABC一二三AB一二A一：[".*A.*B.*C.*A.*B.*A.*",".*一二三.*一二.*一.*"]
		 */
		public static ppl2RegExps(input:string):any[] {
			if (null == input) {
				return null;
			} else if (input.length == 0) {
				return [];
			} else {
				let char0:string=input.charAt(0);
				let isPreChinese:boolean=HanziToPinyinUtil.isChinese(char0);
				let cIndex:number=isPreChinese ? 0 : 1;
				let eIndex:number=1 - cIndex;
				let rs:any[]=[".*", ""];
				for (let i:number=0; i < input.length; i++) {
					let char:string=input.charAt(i);
					let isChinese:boolean=HanziToPinyinUtil.isChinese(char);
					let index:number=isChinese ? cIndex : eIndex;
					let str:string=<string>rs[index] ;
					if (isPreChinese == isChinese && isChinese) {
						str=str + char;
					} else {
						str=str + ".*" + char;
					}
					rs[index]=str;
					isPreChinese=isChinese;
				}
				for (let j:number=rs.length - 1; j >= 0; j--) {
					let s:string=<string>rs[j] ;
					if (s == "") {
						rs.splice(j, 1);
					} else {
						rs[j]=s + ".*";
					}
				}
				return rs;
			}
		}

		/**
		 * 拆分中文与其它字符
		 * @param input
		 * @return
		 * @example
		 * 		一二三ABC一二AB一C：["一二三","ABC","一二","AB","一","C"]
		 * 		ABC一二三AB一二A一：["ABC","一二三","AB","一二","A"]
		 */
		public static ppl2Words(input:string):any[] {
			if (null == input) {
				return null;
			} else if (input.length == 0) {
				return [];
			} else {
				let str:string="";
				let type:number=-1;
				let arr:any[]=[];
				for (let i:number=0; i < input.length; i++) {
					let temp:string=input.charAt(i);
					let tempType:number=PPLUtil.checkType(temp);
					if (type == tempType) {
						str+=temp;
					} else {
						type=tempType;
						if (str != "") {
							arr.push(str);
						}
						str=temp;
					}
				}
				if (str != "") {
					arr.push(str);
				}
				return arr;
			}
		}

		private static checkType(str:string):number {
			return HanziToPinyinUtil.isChinese(str) ? 1 : 0;
		}
	}
