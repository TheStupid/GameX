const os = require("os");
var hostName = os.hostname().toLowerCase();
var projectRoot = "D:/projectX-H5/";
var sourcePath = projectRoot+"src/";
var toolBasePath = "E:/vstsworkspace/projectX/source/tools/H5";
var toolConfig = {
    hostName:hostName,
    tfexe:"C:/Program Files (x86)/Microsoft Visual Studio 10.0/Common7/IDE/tf.exe",
    sourcePath:sourcePath,
    projectRoot:projectRoot,
    toolBasePath:toolBasePath,
    assetsPath:projectRoot+"laya/assets/",
    pagesPath:projectRoot+"laya/pages/",
    binPath:projectRoot+"bin/",
    tmpJsPath:toolBasePath+"/tmpJs/"
};

module.exports = exports = toolConfig;
