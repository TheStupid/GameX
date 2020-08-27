export default interface ILoadingSprite {

	/**
	  * 设置进度
	  */
	setProgress(progress: number): void;

	/**
	  * 设置加载信息
	  */
	setLoadingText(text: string): void;

	dispose(): void;
}
