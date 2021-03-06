﻿const FLA_FILE_NAME_PREFIX = "view";
const PNG_FILE_NAME_PREFIX = "view";
const LINKAGE_CLASS_NAME_PREFIX = "mmo.petcard.view";
const ICON_WIDTH = 33;
const ICON_HEIGHT = 44;

var targetFolderURL = fl.browseForFolderURL("选择目标文件夹");  
var exportFolderURL = null;
if(targetFolderURL == null){
	alert("选择目标文件夹");
}else{
	trace(targetFolderURL);
	var exportFolderURL = fl.browseForFolderURL("选择输出文件夹");  
	if(exportFolderURL == null){
		alert("没有选择输出目录");
	}else{
		trace(exportFolderURL);
		analysisTargetFolder();
	}
}

function prepareFileFolders(){
	outputFolders = ["export"];
	for(var i = 0;i < outputFolders.length;i++){
		folder = exportFolderURL + "/" + outputFolders[i];
		if(!FLfile.exists(folder)){
			FLfile.createFolder(folder);
		}
	}
}

function analysisTargetFolder(){
	var fileList = FLfile.listFolder(targetFolderURL,"files"); 
	for(var i = 0;i < fileList.length;i++){
		var fileName = fileList[i];
		if(!isFlaFile(fileName)){
			continue;
		}
	
		exportFile(fileName);
	}
}

function getFileURI(folderURI,fileName){
	return folderURI + "/" + fileName;
}

function isFlaFile(fileName){
	return fileName.split(".")[1] == "fla";
}

function getKey(fileName){
	return fileName.substr(FLA_FILE_NAME_PREFIX.length);
}

function trace(content){
	fl.outputPanel.trace(content);
}

function exportFile(fileName){
	var uri = getFileURI(targetFolderURL,fileName);
	
	var doc = fl.openDocument(uri);
	var items = doc.library.items; 
	for(var i = 0; i<items.length; i++){
		var item = items[i];
		if(item.linkageClassName != null && item.linkageClassName.indexOf(LINKAGE_CLASS_NAME_PREFIX) >= 0){
			clearStage(doc);
			key = item.linkageClassName.substr(LINKAGE_CLASS_NAME_PREFIX.length);
			trace(key);
			exportIcon(doc,item,key);
		}
	}
	doc.close(false);
}

function exportIcon(doc,item,key){
	doc.getTimeline().addNewLayer();

	doc.width = ICON_WIDTH;
	doc.height = ICON_HEIGHT;

	doc.library.selectItem(item.name);

	doc.addItem({x:0,y:0},item);
	doc.selectAll();
	item = doc.selection[0];
	// iconWidth = ICON_WIDTH - 4;

	// itemScaleX = iconWidth/ item.width;
	// itemScaleY = iconWidth / item.height;

	// scale = Math.min(itemScaleX,itemScaleY)
	// doc.transformSelection(scale, 0, 0, scale);
	// item.width = ICON_WIDTH - 4;
	// item.height = ICON_WIDTH - 4;
	// item.x = 2;
	// item.y = 2;
	// item.x = (ICON_WIDTH - item.width) / 2;
	// item.y = (ICON_WIDTH - item.height) / 2;
	item.x = 0;
	item.y = 0;
	doc.exportPNG(exportFolderURL + "/" + PNG_FILE_NAME_PREFIX + key + ".png",true,true);
}

function clearStage(doc){
	doc.selectNone();
	doc.selectAll();
	if(doc.selection.length > 0) {
		doc.deleteSelection();
	}
}