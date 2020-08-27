import EventDispatcher from '../egret/events/EventDispatcher';
import Dictionary from '../util/Dictionary';
import DateUtil from '../util/DateUtil';

export default class Scheduler extends EventDispatcher {

	private static _instance: Scheduler;
	private tasks: Dictionary<string, Object> = new Dictionary();

	public constructor() {
		super();
		Laya.timer.loop(1000, this, this.onTimer);
	}

	public static get instance(): Scheduler {
		if (Scheduler._instance == null) {
			Scheduler._instance = new Scheduler();
		}
		return Scheduler._instance;
	}

	private onTimer(): void {
		Laya.timer.clear(this, this.onTimer);
		for (var taskInfo of this.tasks.values()) {
			var time = DateUtil.getTimer() - taskInfo["time"];
			if (taskInfo["time"] == null) {
				taskInfo["time"] = DateUtil.getTimer();
			}
			if (time >= taskInfo["interval"]) {
				var task = taskInfo["task"];
				task.run(taskInfo["params"]);
				taskInfo["time"] = DateUtil.getTimer();
			}
		}
		Laya.timer.loop(1000, this, this.onTimer);
	}

	public removeTask(name: string): void {
		this.tasks.remove(name);
	}

	public clear(): void {
		this.tasks.clear();
	}
}