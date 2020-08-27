import Event from "../../egret/events/Event";


export default class SoundManagerEvent extends Event {
    public static ON_SWITCH_ON: string = "ON_SWITCH_ON";

    constructor(type: string) {
        super(type);
    }

}
