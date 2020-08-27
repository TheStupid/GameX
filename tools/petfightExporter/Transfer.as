package {
    import com.adobe.images.*;

    import flash.display.*;
    import flash.display.MovieClip;
    import flash.events.*;
    import flash.filesystem.*;
    import flash.geom.*;
    import flash.utils.*;

    public class Transfer {
        private var _movieContainer:DisplayObjectContainer = null;
        private var _configStream:FileStream = null;
        private var _sourceFile:File;
        private var exportFolder:File;
        private var _currentMovie:MovieClip;
        private var pngFolder:File;
        private var _afterTransfered:Function = null;
        private var _raceId:int = 0;
        private var currentClsConfig:String;
        private var _realCurFrame:int;
        private var _realCurFace:int;

        public function Transfer(movieContainer:MovieClip,swfFile:File, movie:MovieClip, raceId:int, exportParentFolder:File,realCurFrame:int,realCurFace:int,afterTransfer:Function) {
            this._movieContainer = movieContainer;
            this._sourceFile = swfFile;
            this._currentMovie = movie.getChildAt(0) as MovieClip;
            this._raceId = raceId;
            this._afterTransfered = afterTransfer;
            this.clearMovieContainer();
            this._movieContainer.addChild(movie);
            this._realCurFrame = realCurFrame;
            this._realCurFace = realCurFace;
            this.initExportFolder(exportParentFolder);
        }

        private function initExportFolder(parentFolder:File):void{
            var parentFolderPath:String = parentFolder.nativePath;
            var exportFolderPath:String = parentFolderPath + "\\pet" + _raceId + "_"+_realCurFace+"_" + _realCurFrame;
            this.exportFolder = File.documentsDirectory.resolvePath(exportFolderPath);
            if(this.exportFolder.exists){
                try{
                    this.exportFolder.deleteDirectory(true);
                } catch(er:Error){
                }
            }
            this.exportFolder.createDirectory();
        }

        public function doTransfer():void {
            this.currentClsConfig = "mmo.petfight.pet" + _raceId + "_"+_realCurFace+"_" + _realCurFrame + ":";
            trace("原始路径:" + this.exportFolder.nativePath);
            this.pngFolder = this.exportFolder;

            this._currentMovie.addEventListener(Event.ENTER_FRAME, this.onFrameChange);
            this._currentMovie.gotoAndStop(1);
        }// end function

        private function clearMovieContainer():void {
            while(this._movieContainer.numChildren > 0){
                this._movieContainer.removeChildAt(0);
            }
        }

//        private function get exportFolder():File {
//            if(this._exportFolder != null){
//                return this._exportFolder;
//            }
//            var fileName:String = this._sourceFile.nativePath;
//            var index:int = fileName.lastIndexOf(".");
//            var folderName:String = fileName.substring(0, index);
//            this._exportFolder = File.documentsDirectory.resolvePath(folderName);
//            if(this._exportFolder.exists){
//                try{
//                    this._exportFolder.deleteDirectory(true);
//                } catch(er:Error){
//                }
//            }
//            this._exportFolder.createDirectory();
//            return this._exportFolder;
//        }// end function

        private function getMipmapValue(onFrameChange:int):int {
            var _loc_2:* = onFrameChange % 4;
            if(_loc_2 == 0){
                return onFrameChange;
            }
            return onFrameChange + (4 - _loc_2);
        }// end function

        private function get fileName():String {
            return "peticon" + this._raceId;
//            return this._sourceFile.name.substring(0, (this._sourceFile.name.indexOf(this._sourceFile.extension) - 1));
        }// end function

        private function onTransfed():void {
            this.configSteam.close();
        }// end function

        private function onFrameChange(event:Event):void {
            DocClass.instance.addLog("当前处理:第" + this._currentMovie.currentFrame + "帧，共有" +this._currentMovie.totalFrames+"帧");
            var bitmapDataInfo:BitmapDataInfo = this.getBitmapInfo(this._movieContainer);

            var bitmapByteArr:ByteArray = PNGEncoder.encode(bitmapDataInfo.bitmapdata);
            var pngFile:File = File.documentsDirectory.resolvePath(this.pngFolder.nativePath + "/" + this._currentMovie.currentFrame + ".png");
            var fileStream:FileStream = new FileStream();
            fileStream.open(pngFile, FileMode.UPDATE);
            fileStream.writeBytes(bitmapByteArr);
            fileStream.close();

            if(this._currentMovie.currentFrame != 1){
                this.currentClsConfig = this.currentClsConfig + ";";
            }
            this.currentClsConfig = this.currentClsConfig + (bitmapDataInfo.x + "," + bitmapDataInfo.y);
            if (this._currentMovie.currentFrameLabel != null)
            {
                this.currentClsConfig = this.currentClsConfig + "," + this._currentMovie.currentLabel;
            }
            if(this._currentMovie.currentFrame >= this._currentMovie.totalFrames){
                this._currentMovie.stop();
                this.onTransferEnd();
            }
            else
            {
                this._currentMovie.nextFrame();
            }
        }// end function

        private function getBitmapInfo(container:DisplayObject):BitmapDataInfo {
            var x:Number = container.x;
            var y:Number = container.y;
            container.y = 0;
            container.x = 0;
            var bounds:Rectangle = container.getBounds(container);
            var bitmapRect:Rectangle = new Rectangle();
            bitmapRect.x = int(bounds.x - 4);
            bitmapRect.y = int(bounds.y - 4);
            bitmapRect.width = int(bounds.width + bounds.x - bitmapRect.x);
            bitmapRect.height = int(bounds.height + bounds.y - bitmapRect.y);
            var matrix:Matrix = new Matrix();
            matrix.translate(-bitmapRect.x, -bitmapRect.y);
            var width:Number = bitmapRect.width;
            var height:Number = bitmapRect.height
            var bitmapData:BitmapData = new BitmapData(width, height, true, 0);
            bitmapData.draw(container, matrix);
            var bitmapDataInfo:BitmapDataInfo = new BitmapDataInfo(bitmapData, bitmapRect.x, bitmapRect.y);
            return bitmapDataInfo;
        }// end function

//        private function getBitmapInfo(container:DisplayObject):BitmapDataInfo {
//            var x:Number = container.x;
//            var y:Number = container.y;
//            container.y = 0;
//            container.x = 0;
//            var bounds:Rectangle = container.getBounds(container);
//            var bitmapRect:Rectangle = new Rectangle();
//            bitmapRect.x = int(bounds.x - 4);
//            bitmapRect.y = int(bounds.y - 4);
//            bitmapRect.width = int(bounds.width + bounds.x - bitmapRect.x) + 8;
//            bitmapRect.height = int(bounds.height + bounds.y - bitmapRect.y) + 8;
//            var matrix:Matrix = new Matrix();
//            matrix.translate(-bitmapRect.x, -bitmapRect.y);
//            var width:Number = this.getMipmapValue(bitmapRect.width + 4);
//            var height:Number = this.getMipmapValue(bitmapRect.height + 4);
//            var bitmapData:BitmapData = new BitmapData(width, height, true, 0);
//            bitmapData.draw(container, matrix);
//            var bitmapDataInfo:BitmapDataInfo = new BitmapDataInfo(bitmapData, bitmapRect.x, bitmapRect.y);
//            return bitmapDataInfo;
//        }// end function

        private function get configSteam():FileStream {
            if(this._configStream != null){
                return this._configStream;
            }
            var configPath:String = this.exportFolder.nativePath + "\\config.xml";
            var configFile:File = File.documentsDirectory.resolvePath(configPath);
            this._configStream = new FileStream();
            this._configStream.open(configFile, FileMode.WRITE);
            return this._configStream;
        }// end function

        private function onTransferEnd():void {
            this._currentMovie.removeEventListener(Event.ENTER_FRAME, this.onFrameChange);
            this.configSteam.writeMultiByte(this.currentClsConfig, "utf-8");

            this.configSteam.close();
            this._afterTransfered(_raceId);
        }// end function
    }
}
