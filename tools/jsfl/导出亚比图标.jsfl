const FILE_NAME_PREFIX = "peticon";
const LINKAGE_CLASS_NAME_PREFIX = "mmo.pet.peticon";
const SMALL_ICON_WIDTH = 60;
const LARGE_MOVIE_MAX_HEIGHT = 300;
const LARGE_MOVIE_SCALE = 0.75;
const LARGE_MOVIE_INTERVAL_FRAME = 1;

var targetFolderURL = fl.browseForFolderURL("选择原始文件夹");  
var exportFolderURL = null;
if(targetFolderURL == null){
	alert("没有选择原始目录");
}else{
	trace(targetFolderURL);
	var exportFolderURL = fl.browseForFolderURL("选择输出文件夹");  
	if(exportFolderURL == null){
		alert("没有选择输出目录");
	}else{
		trace(exportFolderURL);
		prepareFileFolders();
		analysisTargetFolder(targetFolderURL);
	}
}

function prepareFileFolders(){
	outputFolders = ["large","small","fight"];
	for(var i = 0;i < outputFolders.length;i++){
		folder = exportFolderURL + "/" + outputFolders[i];
		if(!FLfile.exists(folder)){
			FLfile.createFolder(folder);
		}
	}
}

function analysisTargetFolder(targetFolderURI){
	var fileList = FLfile.listFolder(targetFolderURI,"files"); 
	for(var i = 0;i < fileList.length;i++){
		var fileName = fileList[i];
		if(!isFlaFile(fileName)){
			continue;
		}
	
		var fileURI = getFileURI(targetFolderURI,fileName);
		var raceId = getRaceId(fileName);
		exportFile(fileURI,raceId);
	}
}

function getFileURI(folderURI,fileName){
	return folderURI + "/" + fileName;
}

function isFlaFile(fileName){
	return fileName.split(".")[1] == "fla";
}

function getRaceId(fileName){
	return parseInt(fileName.substring(FILE_NAME_PREFIX.length,fileName.length));
}

function trace(content){
	fl.outputPanel.trace(content);
}

function exportFile(uri,raceId){
	var doc = fl.openDocument(uri);
	var items = doc.library.items; 
	for(var i = 0; i<items.length; i++){
		var item = items[i];
		if(item.linkageClassName == LINKAGE_CLASS_NAME_PREFIX + raceId + "_F"){
			clearStage(doc);
			deleteMaskLayer(item);
			exportFightIcon(item,raceId);
		}else if(item.linkageClassName == LINKAGE_CLASS_NAME_PREFIX + raceId + "_S"){
			clearStage(doc);
			exportSmallIcon(doc,item,raceId);
		}else if(item.linkageClassName == LINKAGE_CLASS_NAME_PREFIX + raceId + "_L"){
			clearStage(doc);
			exportLargeIcon(doc,item,raceId)
		}
	}
	doc.close(false);
}

function exportLargeIcon(doc,item,raceId){
	doc.library.selectItem(item.name);
	doc.library.editItem();
	doc.selectAll();
	movieInstance = doc.selection[0];
	movieItem = movieInstance.libraryItem;
	if(movieItem == null){
		return;
	}
	
	doc.exitEditMode();

	doc.addItem({x:0,y:0},movieItem);
	doc.selectAll();
	subItem = doc.selection[0];
	if(subItem != null){
		iconWidth = LARGE_MOVIE_MAX_HEIGHT;
		itemScaleX = iconWidth/ parseInt(subItem.width);
		itemScaleY = iconWidth / parseInt(subItem.height);
		scale = Math.min(itemScaleX,itemScaleY)
		doc.transformSelection(scale, 0, 0, scale);
		subItem.x -= subItem.left;
		subItem.y -= subItem.top;

		doc.width = parseInt(subItem.width);
		doc.height = parseInt(subItem.height);
		
		doc.exportPNG(exportFolderURL + "/large/peticon" + raceId + ".png",true,true);
	}
}


function getLargeIconMovieItemName(doc,item){
	doc.library.selectItem(item.name);
	doc.library.editItem();
	doc.selectAll();
	movieInstance = doc.selection[0];
	movieItem = movieInstance.libraryItem;
	doc.exitEditMode();
	return movieInstance.libraryItem;
}

function removeFramesByInterval(item){
	var curDoc = fl.getDocumentDOM();
	curDoc.library.editItem(item.name);

	selectAllLayers(curDoc);
	curDoc.getTimeline().convertToKeyframes();

	var totalFrame = curDoc.getTimeline().frameCount;
	if(totalFrame > LARGE_MOVIE_INTERVAL_FRAME){
		for(var frameIndex = totalFrame-1;frameIndex > 0;frameIndex--){
			if((frameIndex+1) % LARGE_MOVIE_INTERVAL_FRAME != 0){
				removeFrameInAllLayers(curDoc,frameIndex);
			}
		}
	}

	curDoc.exitEditMode();
}

function removeFrameInAllLayers(curDoc,frameIndex){
	var totalLayer = curDoc.getTimeline().layerCount;
	for(var i = 0;i<totalLayer;i++){
		curDoc.getTimeline().currentLayer = i;
		curDoc.getTimeline().removeFrames(frameIndex,frameIndex);
	}
}

function selectAllLayers(curDoc){
	var totalLayer = curDoc.getTimeline().layerCount;
	curDoc.getTimeline().setSelectedLayers(1);
	if(totalLayer > 2){
		for(var i = 2;i<totalLayer;i++){
			curDoc.getTimeline().setSelectedLayers(i,false);
		}
	}
}

function exportSmallIcon2(doc,item,raceId){
	doc.width = SMALL_ICON_WIDTH;
	doc.height = SMALL_ICON_WIDTH;

	// doc.library.selectItem(item.name);
	// doc.library.editItem();
	// doc.selectAll();
	// subItem = doc.selection[0];
	
	// iconWidth = SMALL_ICON_WIDTH;
	// itemScaleY = iconWidth / parseInt(subItem.height);
	// itemScaleX = iconWidth/ parseInt(subItem.width);
	// scale = Math.min(itemScaleX,itemScaleY)
	// doc.transformSelection(scale, 0, 0, scale);

	// subItem.x -= subItem.left;
	// subItem.y -= subItem.top;
	// doc.exitEditMode();

	doc.addItem({x:0,y:0},item);
	doc.selectAll();
	subItem = doc.selection[0];

	iconWidth = SMALL_ICON_WIDTH;
	itemScaleY = iconWidth / parseInt(subItem.height);
	itemScaleX = iconWidth/ parseInt(subItem.width);
	scale = Math.min(itemScaleX,itemScaleY)
	doc.transformSelection(scale, 0, 0, scale);

	// doc.exportPNG(exportFolderURL + "/small/peticon" + raceId + ".png",true,true);
}

function exportSmallIcon(doc,item,raceId){
	doc.width = SMALL_ICON_WIDTH;
	doc.height = SMALL_ICON_WIDTH;
	doc.addItem({x:0,y:0},item);
	doc.selectAll();
	item = doc.selection[0];
	iconWidth = SMALL_ICON_WIDTH;
	itemScaleY = iconWidth / item.height;
	itemScaleX = iconWidth/ item.width;
	scale = Math.min(itemScaleX,itemScaleY)
	doc.transformSelection(scale, 0, 0, scale);
	item.x = SMALL_ICON_WIDTH / 2;
	offsetX = item.width / 2 + item.left - SMALL_ICON_WIDTH / 2;
	item.x -= offsetX;
	item.y = item.height;
	offsetY = item.top / 2;
	item.y -= offsetY;
	doc.exportPNG(exportFolderURL + "/small/peticon" + raceId + ".png",true,true);
}

function exportFightIcon(item,raceId){
	var doc = fl.getDocumentDOM();
	doc.width = 80;
	doc.height = 96;
	doc.addItem({x:0,y:0},item);
	doc.selectAll();
	item = doc.selection[0];
	doc.setTransformationPoint({x:0, y:0});
	doc.transformSelection(1.42, 0, 0, 1.42);
	item.x = 40;
	item.y = 48;
	doc.exportPNG(exportFolderURL + "/fight/peticon" + raceId + ".png",true,true);
}

function deleteMaskLayer(item){
	var doc = fl.getDocumentDOM();
	doc.library.selectItem(item.name);
	doc.library.editItem();

	var layers = doc.getTimeline().layers;
	for(i = layers.length - 1;i >= 0;i--){
		var curLayer = layers[i];
		fl.getDocumentDOM().getTimeline().setSelectedLayers(i);
		if(curLayer.layerType == "mask"){
			doc.getTimeline().deleteLayer();
		}
	}
	
	doc.exitEditMode();
}

function clearStage(doc){
	doc.selectNone();
	doc.selectAll();
	if(doc.selection.length > 0) {
		doc.deleteSelection();
	}
}