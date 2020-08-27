import InitServiceEvent from './InitServiceEvent';
import ServiceContainerEvent from './ServiceContainerEvent';
import ServiceConfig from './ServiceConfig';
import IInitService from './IInitService';
import IService from './IService';
import EventDispatcher from '../egret/events/EventDispatcher';

export default class ServiceContainer extends EventDispatcher {

	private static _instance: ServiceContainer;
	private static _serviceInstanceMap: Object = {};
	private static _serviceInitedMap: Object = {};

	constructor() {
		super();
	}

	public static get instance(): ServiceContainer {
		if (ServiceContainer._instance == null) {
			ServiceContainer._instance = new ServiceContainer();
		}
		return ServiceContainer._instance;
	}

	public static getService(value: ServiceConfig | string): any {
		if (typeof value === "string") {
			value = ServiceConfig.getConfig(value);
		}
		let service: IService = ServiceContainer._serviceInstanceMap[value.name];
		if (service == null) {
			service = new value.classRef();
			ServiceContainer._serviceInstanceMap[value.name] = service;
			if (service["init"]) {
				let onInited = (evt: InitServiceEvent) => {
					let name = (<ServiceConfig>value).name;
					ServiceContainer._serviceInitedMap[name] = true;
				};
				service.once(InitServiceEvent.onInited, onInited, this);
			} else {
				ServiceContainer._serviceInitedMap[value.name] = true;
			}
		}
		return service;
	}

	public static tryGetService(value: ServiceConfig | string, callback: Function = null, thisObject: any = null
		, params: Object = null): void {
		if (typeof value === "string") {
			value = ServiceConfig.getConfig(value);
		}
		let service: IInitService = ServiceContainer.getService(value) as IInitService;
		let serviceName = value.name;
		if (ServiceContainer._serviceInitedMap[serviceName] == true) {//已经初始化
			callback.apply(thisObject, [service, params]);
			return;
		}
		let onInited = (evt: InitServiceEvent) => {
			let event = new ServiceContainerEvent(ServiceContainerEvent.onGetService, serviceName, service, params);
			ServiceContainer.instance.dispatchEvent(event);
			callback.apply(thisObject, [service, params]);
		};
		service.once(InitServiceEvent.onInited, onInited, this);
		service.init();
	}
}