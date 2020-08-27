const FLA_FILE_NAME_PREFIX = "a";
const PNG_FILE_NAME_PREFIX = "a";
const LINKAGE_CLASS_NAME_PREFIX = "a";
const ICON_WIDTH = 70;
const ICON_HEIGHT = 70;
const MaxId = 30000;

var targetFolderURL = fl.browseForFolderURL("选择目标文件夹，即skinicon文件夹");  
var exportFolderURL = null;
var fileName = null;
var startId;

if(targetFolderURL == null){
	alert("选择目标文件夹");
}else{
	trace(targetFolderURL);
	var exportFolderURL = fl.browseForFolderURL("选择输出文件夹");  
	if(exportFolderURL == null){
		alert("没有选择输出目录");
	}else{
        trace(exportFolderURL);
        var conf = prompt("Enter StartId", "输入开始转换的服装Id，默认最大转换Id为30000");
        startId = parseInt(conf);
		analysisTargetFolder();
	}
}

function analysisTargetFolder(){
	var fileList = FLfile.listFolder(targetFolderURL,"files"); 
	for(var i = 0;i < fileList.length;i++){
		fileName = fileList[i];
		if(!isFlaFile()){
			continue;
        }
        var fileStr = fileName.split(".")[0];
        var fileStrIndex = fileStr.slice(1);
        if (parseInt(fileStrIndex, 10) < startId) {
            continue;
        }
        else if (parseInt(fileStrIndex, 10) > MaxId) {
			continue;
		}
		exportFile();
	}
}

function getFileURI(folderURI){
	return folderURI + "/" + fileName;
}

function isFlaFile(){
	return fileName.split(".")[1] == "fla";
}

function getKey(){
	return fileName.substr(FLA_FILE_NAME_PREFIX.length);
}

function trace(content){
	fl.outputPanel.trace(content);
}

function exportFile(){
	var uri = getFileURI(targetFolderURL);
	
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
	doc.width = ICON_WIDTH;
	doc.height = ICON_HEIGHT;

	doc.library.selectItem(item.name);

	doc.addItem({x:0,y:0},item);
	doc.selectAll();
	item = doc.selection[0];
	iconWidth = ICON_WIDTH - 4;

	itemScaleX = iconWidth/ item.width;
	itemScaleY = iconWidth / item.height;

	scale = Math.min(itemScaleX,itemScaleY)
	doc.transformSelection(scale, 0, 0, scale);
	// item.width = ICON_WIDTH - 4
	// item.height = ICON_WIDTH - 4;
	// item.x = 2;
	// item.y = 2;
	item.x = (ICON_WIDTH - item.width) / 2;
	item.y = (ICON_WIDTH - item.height) / 2;
	doc.exportPNG(exportFolderURL + "/" + fileName.split(".")[0] + ".png",true,true);
}

function clearStage(doc){
	doc.selectNone();
	doc.selectAll();
	if(doc.selection.length > 0) {
		doc.deleteSelection();
	}
}