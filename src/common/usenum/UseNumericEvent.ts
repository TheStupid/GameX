import Event = Laya.Event;

export default class UseNumericEvent extends Event {
    public static UPDATE: string = "UIComponentEvent_update";
    public static UPPER_LIMIT: string = "UIComponentEvent_upper_limit";
    public static LOWER_LIMIT: string = "UIComponentEvent_lower_limit";
}
