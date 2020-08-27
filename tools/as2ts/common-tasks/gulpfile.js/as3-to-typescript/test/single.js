/*jshint node:true*/
const  toolConfig = require("../../tool_config");
var AoqiH5PreHandle = require('../lib/aoqiH5PreHandle');
var AoqiH5AfterHandle = require('../lib/aoqiH5AfterHandle');
var AsFilePath = toolConfig.sourcePath+"ts-learning/DMTF_MainPanel.as";
// var AsFilePath = toolConfig.sourcePath+"activityext/20190830/darkmoyantianqifight/model/DMTF_Model.as";
// var AsFilePath = toolConfig.sourcePath+"ts-learning/DMTF_FightMainPanel.as";
// var AsFilePath = toolConfig.sourcePath+"ts-learning/ArenaV2Manager.as";
// var AsFilePath = toolConfig.sourcePath+"ts-learning/GLS_Controller.as";
// var AsFilePath = toolConfig.sourcePath+"ts-learning/ActivateProficient.as";
// var AsFilePath = toolConfig.sourcePath+"ts-learning/IInteractHelper.as"
var AS3Parser = require('../lib/parser'),
    emitter = require('../lib/emitter'),
    fs = require('fs'),
    path = require('path');

var parser = new AS3Parser();


var content = fs.readFileSync(AsFilePath, 'UTF-8' );
var aoqiPreHandle = new AoqiH5PreHandle();
content = aoqiPreHandle.handle(content);
var ast = parser.buildAst(path.basename(AsFilePath), content);
var fileName = path.basename(AsFilePath,".as");
var targetPath = path.join(toolConfig.sourcePath ,'ts-learning', 'test', fileName+".ts");
fs.writeFileSync(path.join(toolConfig.sourcePath ,'ts-learning', 'test', fileName+'.ast.json'), JSON.stringify(ast, null, 4));

content = emitter.emit(ast, content,targetPath);
var aoqiAfterHandle = new AoqiH5AfterHandle();
content = aoqiAfterHandle.handle(content);
fs.writeFileSync(targetPath,  content);

