export default class MatchingUtil {
		public static match(source:string, expression:string):any[] {
			if (null == source || null == expression || expression.length > source.length) {
				return null;
			}
			let ei:number=0;
			let si:number=0;
			let result:any[]=[];
			for (; ei < expression.length; ei++) {
				let eChar:string=expression.charAt(ei);
				if (" " != eChar) {
					for (; si < source.length; ) {
						let sChar:string=source.charAt(si);
						let tempSi:number=si;
						si++;
						if (eChar == sChar) {
							result.push(tempSi);
							if (ei == expression.length - 1) {
								return result;
							}
							break;
						}
					}
				}
				if (si == source.length) {
					return null;
				}
			}
			return result;
		}

		public static computeMatchResult(matchResult:any[]):number {
			if (null != matchResult && matchResult.length > 0) {
				let result:number=0;
				for  (let index of matchResult) {
					result+=(1 / Math.pow(2, index));
				}
				return result;
			} else {
				return 0;
			}
		}
	}

