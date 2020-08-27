package {
    import flash.display.Loader;
    import flash.display.LoaderInfo;
    import flash.display.MovieClip;
    import flash.display.Sprite;
    import flash.events.Event;
    import flash.events.IOErrorEvent;
    import flash.events.MouseEvent;
    import flash.filesystem.File;
    import flash.geom.Rectangle;
    import flash.net.URLRequest;
    import flash.net.URLStream;
    import flash.system.ApplicationDomain;
    import flash.system.LoaderContext;
    import flash.text.TextField;
    import flash.utils.ByteArray;
    import flash.utils.getDefinitionByName;

    public class DocClass extends MovieClip {
        private const MAX_HEIGHT:int = 300;
        private const MAX_WIDTH:int = 300;

        public static var _instance:DocClass = null;
        public static function get instance():DocClass{
            return _instance;
        }

        private var _sourceDir:File = null;
        private var _exportDir:File = null;
        private var loader:Loader = null;
        private var _swfFileList:Array = [];
        private var _curProgressIndex:int = -1;

        private var _curMv:MovieClip = null;

        public function DocClass() {
            _instance = this;
            init();
        }

        private function init():void {
            this.addEventListener(MouseEvent.CLICK, onClickPanel);

            this.setTxtSource("还没选择文件目录");
            this.setTxtTarget("还没选择输出文件夹");
            this.clearLog();
        }

        private function onClickPanel(e:MouseEvent):void {
            var targetName:String = e.target.name;
            if(targetName == "btnSource"){
                selectSourceFile();
            } else if(targetName == "btnStart"){
                startConvert();
            }else if(targetName == "btnTarget"){
                this.selectTargetFile();
            }else if(targetName == "btnDefault"){
                if(this._sourceDir){
                    this.setDefaultExportDir(this._sourceDir.nativePath);
                }else{
                    this.setTxtTarget("还没选择源文件夹");
                }
            }
        }

        private function startConvert():void {
            if(_sourceDir == null){
                return;
            }
            if(_exportDir == null){
                return;
            }

            this.convertNext();
        }

        private function convertNext():void {
//            if(this._curMv && this._curMv.parent){
//                this._curMv.parent.removeChild(this._curMv);
//            }

            if(this.loader != null){
                this.loader.unload();
            }

            if(this._curProgressIndex >= this._swfFileList.length - 1){
                this.addLog("转换完毕");
                return;
            }

            this._curProgressIndex++;
            var targetFile:File = this._swfFileList[this._curProgressIndex];

            this.setTxtProgress("文件处理中……" + (this._curProgressIndex + 1) + "/" + this._swfFileList.length);
            this.addLog("开始加载文件：" + targetFile.name);

            var streamLoader:URLStream = new URLStream();
            streamLoader.addEventListener(Event.COMPLETE, this.onLoadBytesOK);
            streamLoader.addEventListener(IOErrorEvent.IO_ERROR, this.onIoError);
            streamLoader.load(new URLRequest(targetFile.nativePath));
        }

        private function onLoadComplete(event:Event):void {
            this.addLog("读取文件成功");
            var loader:LoaderInfo = event.target as LoaderInfo;
            loader.loader.removeEventListener(Event.COMPLETE, this.onLoadComplete);
            loader.loader.removeEventListener(IOErrorEvent.IO_ERROR, this.onIoError);

            var fileFullName:String = this.curProcessFile().name;
            trace("文件全名" + fileFullName);
            var raceId:int = parseInt(fileFullName.split(".")[0].substr("peticon".length));
            trace("当前亚比id" + raceId);

            if(!this.isValid(raceId)){
                this.convertNext();
                return;
            }
            var sourceMovie:MovieClip = this.getSourceMovie(raceId);
            sourceMovie.gotoAndStop(1);
            trace("numChildren" + sourceMovie.numChildren + sourceMovie.getChildAt(0));
            if(sourceMovie.numChildren == 0 || !(sourceMovie.getChildAt(0) is Sprite)){
                this.convertNext();
            }else{
//                var scaleRate:Number = this.getScaleRate(raceId);
//                trace("Scale" + scaleRate);
                var bottom:Number = this.getBottom(raceId);
                trace("bottom:" + bottom);
                var subMovie:MovieClip = sourceMovie.getChildAt(0) as MovieClip;
                subMovie.y -= bottom;

                var scaleX:Number = this.MAX_WIDTH / sourceMovie.width;
                var scaleY:Number = this.MAX_HEIGHT / sourceMovie.height;
                var scaleRate:Number = Math.min(scaleX,scaleY);
                sourceMovie.scaleX = sourceMovie.scaleY = scaleRate;

                new Transfer(this.movieContainer,this.curProcessFile(),sourceMovie,raceId,this._exportDir,this.convertNext).doTransfer();
//                sourceMovie.x = 350;
//                sourceMovie.y = 360;
//                this.addChild(sourceMovie);
//                this._curMv = sourceMovie;
            }
        }

        private function isValid(raceId:int):Boolean{
            var clsName:String = "mmo.pet.peticon"+raceId+"_L";
            try{
                var sourceMovieCls:Class = getDefinitionByName(clsName) as Class;
                return sourceMovieCls != null;
            }catch(e){
                return false;
            }
            return false;
        }

        private function getSourceMovie(raceId:int):MovieClip{
            var clsName:String = "mmo.pet.peticon"+raceId+"_L";
            var sourceMovieCls:Class = getDefinitionByName(clsName) as Class;
            var sourceMovie:MovieClip = new sourceMovieCls() as MovieClip;
            return sourceMovie;
        }

        private function getBottom(raceId:int):Number{
            var sourceMovie:MovieClip = this.getSourceMovie(raceId);
            var movie:MovieClip = sourceMovie.getChildAt(0) as MovieClip;
            var totalFrame:int = movie.totalFrames;
            var maxBottom:Number = -1000;
            for(var i:int = 0;i < totalFrame;i++){
                movie.gotoAndStop(i + 1);
                var rect:Rectangle = movie.getBounds(sourceMovie);
                trace("rect.bottom" + rect.bottom);
                if(rect.bottom > maxBottom){
                    maxBottom = rect.bottom;
                }
            }
            return maxBottom;
        }

//        private function getScaleRate(raceId:int):Number{
//            var movie:MovieClip = this.getSubMovie(raceId);
//            var totalFrame:int = movie.totalFrames;
//            var finalScale:Number = 10000;
//            for(var i:int = 0;i < totalFrame;i++){
//                movie.gotoAndStop(i + 1);
//                var rect:Rectangle = movie.getBounds(movie);
//                var scaleX:Number = MAX_WIDTH / rect.width
//                var scaleY:Number = MAX_HEIGHT / rect.height;
//                var scale:Number = Math.min(scaleX,scaleY);
//                finalScale = Math.min(scale,finalScale);
//            }
//            return finalScale;
//        }

        private function get movieContainer():MovieClip{
            return this["mcView"];
        }

        private function onLoadBytesOK(event:Event):void {
            this.addLog("成功加载文件，开始读取文件");
            var streamLoader:URLStream = event.target as URLStream;
            streamLoader.removeEventListener(Event.COMPLETE, this.onLoadBytesOK);
            streamLoader.removeEventListener(IOErrorEvent.IO_ERROR, this.onIoError);
            var byteArray:ByteArray = new ByteArray();
            streamLoader.readBytes(byteArray);
            streamLoader.close();
            this.loader = new Loader();
            this.loader.contentLoaderInfo.addEventListener(Event.COMPLETE, this.onLoadComplete);
            var context:LoaderContext = new LoaderContext(false, ApplicationDomain.currentDomain);
            context.allowLoadBytesCodeExecution = true;
            this.loader.loadBytes(byteArray, context);
        }

        private function onIoError(event:Event):void {
            var urlStream:URLStream = event.target as URLStream;
            urlStream.removeEventListener(Event.COMPLETE, this.onLoadBytesOK);
            urlStream.removeEventListener(IOErrorEvent.IO_ERROR, this.onIoError);
            this.setTxtProgress("加载文件失败:" + this.curProcessFile().name);
        }

        private function curProcessFile():File {
            return this._swfFileList[this._curProgressIndex];
        }

        private function setTxtProgress(text:String):void {
            var txtProgress:TextField = this["txtProgress"];
            txtProgress.text = text;
        }

        private function selectTargetFile():void {
            var targetDir:File = new File();
            targetDir.addEventListener(Event.SELECT, this.onSelectTarget);
            targetDir.browseForDirectory("请选择输出文件夹");
        }

        private function onSelectTarget(event:Event):void {
            _exportDir = File(event.target);
            var filePath:String = _exportDir.nativePath;
            this.setTxtTarget(filePath)
        }

        private function selectSourceFile():void {
            this._sourceDir = new File();
            this._sourceDir.addEventListener(Event.SELECT, this.onSelectSource);
            this._sourceDir.browseForDirectory("请选择文件目录");
        }

        private function onSelectSource(event:Event):void {
            this._swfFileList = [];
            var targetFile:File = File(event.target);
            var filePath:String = targetFile.nativePath;
            this.setTxtSource(filePath);
//            this.setDefaultExportDir(filePath);

            var subFileList:Array = targetFile.getDirectoryListing();
            for each(var subFile:File in subFileList){
                if(subFile.name.indexOf(".swf") >= 0){
                    this._swfFileList.push(subFile);
                }
            }
        }

        private function setDefaultExportDir(sourceFilePath:String):void{
            var exportDirPath:String = sourceFilePath + "\\export";
            this._exportDir = new File(exportDirPath);
            if(!this._exportDir.exists){
//                try{
//                    this._exportDir.deleteDirectory(true);
//                } catch(er:Error){
//                }
                this._exportDir.createDirectory();
            }
            this.setTxtTarget(exportDirPath);
        }

        private function setTxtSource(text:String):void {
            var txtSource:TextField = this["txtSource"];
            txtSource.text = text;
        }

        private function setTxtTarget(text:String):void {
            var txtTarget:TextField = this["txtTarget"];
            txtTarget.text = text;
        }

        public function addLog(text:String):void {
            var txtLog:TextField = this["txtLog"];

            if(txtLog.text.length > 300){
                clearLog();
            }

            txtLog.appendText("\n" + text);
            txtLog.scrollV = txtLog.maxScrollV;
        }

        private function clearLog():void {
            var txtLog:TextField = this["txtLog"];
            txtLog.text = "";
        }
    }
}
