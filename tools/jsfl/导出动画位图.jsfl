var doc = fl.getDocumentDOM();
var targetFolderURL = fl.browseForFolderURL("选择导出文件夹");
var prefix = prompt("movie name","输入动画名称");
if(targetFolderURL != null && prefix != null){
	startExport();
}


function startExport(){
	doc.selectAll();
	item = doc.selection[0];
	var exporter = new SpriteSheetExporter();
	exporter.addSymbol(item, "mc");
	exporter.algorithm = "maxRects";
	exporter.allowTrimming = true;
	exporter.autoSize = true;
	exporter.stackDuplicateFrames = true;
	exporter.layoutFormat = "JSON";
	exporter.exportSpriteSheet(targetFolderURL + "/" + prefix, {format:"png", bitDepth:32, backgroundColor:"#00000000"});
}
