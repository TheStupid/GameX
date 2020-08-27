import { HangUpLevel } from "./HangUpLevel";
import Box = Laya.Box;

export default class LayerInfo {

	public subLayers: Box[] = [];
	public hangUpLevel: HangUpLevel = HangUpLevel.DESTROY;

	public constructor() {
	}
}
