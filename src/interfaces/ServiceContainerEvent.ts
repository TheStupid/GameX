import IService from './IService';
import Event from '../egret/events/Event';

export default class ServiceContainerEvent extends Event {
	public static readonly onGetService = "onGetService";
	public params: Object;
	public serviceName: string;
	public service: IService;

	constructor(type: string, serviceName: string, service: IService, params: Object) {
		super(type);
		this.params = params;
		this.serviceName = serviceName;
		this.service = service;
	}
}