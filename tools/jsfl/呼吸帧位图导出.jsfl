clearOutputPanel();
const INTERVAL_FRAME = 4;
var doc;
var lib;

var targetFolderURL = fl.browseForFolderURL("选择目标文件夹");  
var curDirURL;
var raceId;
var offsetX;
var offsetY;

if(targetFolderURL == null){
	alert("没有选择目录");
}else{
	trace(targetFolderURL);
	prepareExportFolder();
	startImport();
}

function prepareExportFolder(){
	outputFolders = ["breath"];
	for(var i = 0;i < outputFolders.length;i++){
		folder = targetFolderURL + "/" + outputFolders[i];
		if(!FLfile.exists(folder)){
			FLfile.createFolder(folder);
		}
	}
}

function startImport(){
	var directories = FLfile.listFolder(targetFolderURL,"directories");
	for(var i = 0;i < directories.length;i++){
		var dir = directories[i];
		if(dir.indexOf("peticon") >= 0){
			raceId = Number(dir.substring("peticon".length));
			curDirURL = targetFolderURL + "/" + dir;
			importSingle();
		}
	}
}

function clearOutputPanel(){
	fl.outputPanel.clear();
}

function trace(text){
	fl.outputPanel.trace(text);
}

function importSingle(){
	var configFileURL = curDirURL + "/config.xml";
	trace(configFileURL);
	if(FLfile.exists(configFileURL)){
		var data = FLfile.read(configFileURL)
		var dataItems = data.split(":");
		var points = getPoints(dataItems[1]);
		initOffset(points);
		importClass(dataItems[0], points,"peticon");
	}else{
		trace("找不到config文件");
	}
}

function initOffset(points){
	offsetX = 0;
	offsetY = 0;
	for(var i = 0;i < points.length;i++){
		var pt = points[i];
		if(pt.x < offsetX){
			offsetX = pt.x;
		}
		if(pt.y < offsetY){
			offsetY = pt.y;
		}
	}
}

function getPoints(pointConfig){
	var pointDatas = pointConfig.split(";");
	var points = [];	
	for(var pointIndex = 0; pointIndex < pointDatas.length; pointIndex ++){
		var pointPair = pointDatas[pointIndex];
		var datas = pointPair.split(",");
		points[pointIndex] = {x:Number(datas[0]), y:Number(datas[1])};
	}
	return points;
}

function createNewDoc(){
	doc = fl.createDocument();
	lib = doc.library;
}

function importClass(className, points,libItemName){
	createNewDoc();

	trace("Total Frames:" + points.length);
	var pngFolder = "png";
	improtPNGs2Lib(points.length,pngFolder, className);
	addSpriteSheetItem(libItemName,className)
	addPNG2TimeLine(libItemName,points,pngFolder)
	exportBreathAtlas(libItemName);

	clearExport();
	closeDoc();
}

function closeDoc(){
	doc.close(false);
}

function exportBreathAtlas(libItemName){
	doc.exitEditMode();
	clearStage();
	
	trace(libItemName);
	lib.selectItem(libItemName)
	item = lib.getSelectedItems()[0];
	trace(item.name);

	doc.addItem({x:0,y:0},item);
	doc.selectAll();
	itemInstance = doc.selection[0];

	var exporter = new SpriteSheetExporter();
	exporter.addSymbol(itemInstance, "mc");
	exporter.algorithm = "maxRects";
	exporter.allowTrimming = true;
	exporter.autoSize = true;
	exporter.stackDuplicateFrames = true;
	exporter.layoutFormat = "JSON";
	exporter.exportSpriteSheet(targetFolderURL + "/breath/peticon" + raceId, {format:"png", bitDepth:32, backgroundColor:"#00000000"});
}

function clearStage(){
	doc.selectNone();
	doc.selectAll();
	if(doc.selection.length > 0) {
		doc.deleteSelection();
	}
}

function addPNG2TimeLine(libItemName,points,pngFolder){
	var totalFrame = points.length;
	var intervalFrame = Math.ceil(totalFrame / 7);//1-7帧就是1，8-14就是2，15-21就是3，21-28就是4
	lib.editItem(libItemName);										
	timeline = doc.getTimeline();
	timeline.setSelectedLayers(0);
	for(var frameIndex = 0; frameIndex < totalFrame; frameIndex ++){
		if(frameIndex % intervalFrame == 0){
			if(frameIndex != 0){
				timeline.convertToKeyframes();
			}

			doc.selectAll();
			if(doc.selection.length > 0) {
				doc.deleteSelection();
			}

			timeline.setSelectedFrames(frameIndex, frameIndex);
			var pngPath = pngFolder + "/" + (frameIndex + 1) + ".png";
			lib.addItemToDocument({x:0, y:0}, pngPath);
			var item = doc.selection[0];		
			doc.moveSelectionBy({x:-item.x, y:-item.y})
			var point = points[frameIndex];
			// doc.moveSelectionBy({x:point.x - offsetX, y:point.y - offsetY});		
			doc.moveSelectionBy({x:point.x, y:point.y});		
		}
	}
}

function addSpriteSheetItem(libItemName,className){
	if(lib.itemExists(libItemName)){
		lib.deleteItem(libItemName);
	}

	lib.addNewItem("movie clip", libItemName);
	lib.setItemProperty('linkageExportForAS', true);
	lib.setItemProperty('linkageExportInFirstFrame', true);
	lib.setItemProperty('linkageClassName', className);
	lib.setItemProperty('linkageBaseClass', "flash.display.MovieClip");
}

function improtPNGs2Lib(totalFrames, pngFolder, className){
	if(lib.itemExists(pngFolder)){
		lib.deleteItem(pngFolder);
	}
	lib.newFolder(pngFolder);	
	for(var frame = 1; frame <= totalFrames; frame ++){
		var fileName = frame + ".png";
		var pngUrl = curDirURL + "/"+ fileName;
		//fl.trace("import png:" + pngUrl);
		doc.importFile(pngUrl, true);
		lib.selectItem(fileName);
		lib.moveToFolder(pngFolder);		
		
		lib.setItemProperty('linkageExportForAS', true);
		lib.setItemProperty('linkageExportInFirstFrame', true);
		lib.setItemProperty('linkageClassName', className + "_" + frame);					
		lib.setItemProperty('allowSmoothing', true);
		lib.setItemProperty('compressionType', 'lossless');
	}
}

function clearExport(){
	if(lib.getItemProperty("linkageExportForAS")){
		lib.setItemProperty("linkageClassName", "");								
		lib.setItemProperty("linkageExportForAS", false);
	}
}