import Handler = Laya.Handler;
import CallbackUtil from "../callback/CallbackUtil";

export default class ShowBonusHelper {
    private static CombineBNTypes: any[] = [117, 100, 98, 101];
    private static FilterTypes: any[] = [111, 19, 20];

    public static showBonus(bonusInput: any[], onClosed?: Function | Handler): void {
        if (bonusInput == null || bonusInput.length <= 0) {
            CallbackUtil.apply(onClosed);
            return;
        }

        bonusInput = bonusInput.concat();

        let combineBnMap: object = {};
        for (let i: number = bonusInput.length - 1; i >= 0; i--) {
            let bn: object = bonusInput[i];
            let type: number = bn["type"];
            if (this.FilterTypes.indexOf(type) >= 0) {
                bonusInput.splice(i, 1);
            }
            let combineBNIndex: number = this.CombineBNTypes.indexOf(type);
            if (combineBNIndex >= 0) {
                if (combineBnMap[combineBNIndex] == null) {
                    combineBnMap[combineBNIndex] = {"type": type, "id": 0, "num": 0};
                }
                combineBnMap[combineBNIndex]["num"] += bn["num"];
                bonusInput.splice(i, 1);
            }
        }

        for (let key in combineBnMap) {
            if (combineBnMap[key]) {
                bonusInput.push(combineBnMap[key]);
            }
        }

        if (bonusInput.length <= 0) {
            CallbackUtil.apply(onClosed);
            return;
        }

        bonusInput.sort((bn1: object, bn2: object) => {
            let type1: number = bn1["type"];
            let type2: number = bn2["type"];
            let combineBNIndex1: number = this.CombineBNTypes.indexOf(type1);
            let combineBNIndex2: number = this.CombineBNTypes.indexOf(type2);
            return combineBNIndex2 - combineBNIndex1;
        });
    }

    public static createBonus(type: number, id: number, num: number = 1): Object {
        return {"type": type, "id": id, "num": num};
    }
}


