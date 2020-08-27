import Event from '../../egret/events/Event';

export default class TimerEvent extends Event {

    public static readonly TIMER: string = "timer";
    public static readonly TIMER_COMPLETE: string = "timerComplete";
}