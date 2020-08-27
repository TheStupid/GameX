import IService from './IService';

export default interface IInitService extends IService {
	init(): void;
}