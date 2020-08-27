var curDoc = fl.getDocumentDOM();
var docURI = curDoc.pathURI;
var lastIndex = docURI.lastIndexOf("/");
var parentFolder = docURI.substr(0,lastIndex);
var prefix = prompt("img_item","输入位图前缀");
var targetFolder;

prepareTargetFolder();
convertFramesToBitmap();

function prepareTargetFolder(){
	targetFolder = parentFolder + "/export";
	if(!FLfile.exists(targetFolder)) {
		FLfile.createFolder(targetFolder);
	}
}

function convertFramesToBitmap(){
	var totalFrame = curDoc.getTimeline().frameCount;
	for(var i = 0;i < totalFrame;i++){
		curDoc.getTimeline().setSelectedFrames(i,i);
		curDoc.selectAll();
		if(curDoc.selection.length > 0){
			curDoc.exportPNG(targetFolder + "/" + prefix + i + ".png",true,true);
		}
	}
}

function trace(text){
	fl.outputPanel.trace(text);
}
