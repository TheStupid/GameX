const FILE_NAME_PREFIX = "attribute";
const LINKAGE_CLASS_NAME_PREFIX = "mmo.pet.attribute";
const ICON_WIDTH = 46;

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
		prepareFileFolders();
		analysisTargetFolder(targetFolderURL);
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

function analysisTargetFolder(targetFolderURI){
	var fileList = FLfile.listFolder(targetFolderURI,"files"); 
	for(var i = 0;i < fileList.length;i++){
		var fileName = fileList[i];
		if(!isFlaFile(fileName)){
			continue;
		}
	
		var fileURI = getFileURI(targetFolderURI,fileName);
		var id = getId(fileName);
		exportFile(fileURI,id);
	}
}

function getFileURI(folderURI,fileName){
	return folderURI + "/" + fileName;
}

function isFlaFile(fileName){
	return fileName.split(".")[1] == "fla";
}

function getId(fileName){
	if(fileName == FILE_NAME_PREFIX){
		return 0;
	}else{
		return parseInt(fileName.substring(FILE_NAME_PREFIX.length,fileName.length));
	}
}

function trace(content){
	fl.outputPanel.trace(content);
}

function exportFile(uri,id){
	var doc = fl.openDocument(uri);
	var items = doc.library.items; 
	for(var i = 0; i<items.length; i++){
		var item = items[i];
		if(item.linkageClassName != null && item.linkageClassName.indexOf(LINKAGE_CLASS_NAME_PREFIX) >= 0){
			clearStage(doc);
			exportIcon(doc,item,id);
		}
	}
	doc.close(false);
}

function exportIcon(doc,item,id){
	doc.width = ICON_WIDTH;
	doc.height = ICON_WIDTH;

	doc.library.selectItem(item.name);

	doc.addItem({x:0,y:0},item);
	doc.selectAll();
	item = doc.selection[0];
	iconWidth = ICON_WIDTH - 4;

	itemScaleX = iconWidth/ item.width;
	itemScaleY = iconWidth / item.height;

	scale = Math.min(itemScaleX,itemScaleY)
	doc.transformSelection(scale, 0, 0, scale);
	// item.width = ICON_WIDTH - 4;
	// item.height = ICON_WIDTH - 4;
	// item.x = 2;
	// item.y = 2;
	item.x = (ICON_WIDTH - item.width) / 2;
	item.y = (ICON_WIDTH - item.height) / 2;
	doc.exportPNG(exportFolderURL + "/export/attribute" + id + ".png",true,true);
}

function clearStage(doc){
	doc.selectNone();
	doc.selectAll();
	if(doc.selection.length > 0) {
		doc.deleteSelection();
	}
}