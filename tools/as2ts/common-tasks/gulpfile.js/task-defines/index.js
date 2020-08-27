const {copyRelatedRes2TargetDirectory} = require("../copyRelatedRes2TargetDirectory");
const {incrementalCompilation} = require("../incremental-compilation");

function copyRelatedRes2TargetDirectoryInteractiveTask(cb){
    var argvs = process.argv.slice(2);
    for (var i = 0; i < argvs.length; i++) {
        argvs[i] = argvs[i].replace("--","");
    }
    console.log("argvs:"+argvs);
    copyRelatedRes2TargetDirectory(function () {
        console.log("copyRelatedRes2TargetDirectory finished");
        if(cb!=null){
            cb();
        }
    },argvs[2],argvs[3]);
    // copyRelatedRes2TargetDirectory("","D:\\projectX-H5\\laya\\pages\\proficient\\res\\SelectPanel.scene","proficient/res")
}
const TASK_DEFINES ={
    "copyRelatedRes2TargetDirectory":{
        "taskFun":copyRelatedRes2TargetDirectoryInteractiveTask,
        "desc":"修改scene中的美术资源路径,拷贝美术目录资源到相应开发目录;Buttton节点stateNum=1,自动设置默认runtime"
    }
    ,
    "incrementalCompilation":{
        "taskFun":incrementalCompilation,
        "desc":"增量编译"
    }
}

module.exports = TASK_DEFINES;