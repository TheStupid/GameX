// const {copyRelatedRes2TargetDirectory} = require("./copyRelatedRes2TargetDirectory");
const taskDefines = require("./task-defines");

function getExportTasks() {
    var exportTasks = {};
    for(var taskKey in taskDefines){
        var taskDefine = taskDefines[taskKey];
        exportTasks[taskKey] = taskDefine.taskFun;
    }
    return exportTasks;
}
module.exports = getExportTasks();
// function askForInput(){
//     var argvs = process.argv.slice(2);
//     for (var i = 0; i < argvs.length; i++) {
//         argvs[i] = argvs[i].replace("--","");
//     }
//     console.log("argvs:"+argvs);
//     copyRelatedRes2TargetDirectory(null,argvs[2],argvs[3]);
//
//     // copyRelatedRes2TargetDirectory("","D:\\projectX-H5\\laya\\pages\\proficient\\res\\SelectPanel.scene","proficient/res")
// }
// module.exports = {
//     "copyRelatedRes2TargetDirectory": askForInput
// }
