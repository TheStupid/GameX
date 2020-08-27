const { spawnSync ,spawn} = require('child_process');
const buildConfig = require("../buildconfig");
const fs = require('fs');
const {logger} = require('../logger');
const  helper = require('../helper');

class TfOperation{
    constructor(){

    }



    static get(path){
        logger.info("----------tf get start -----------");
        logger.info("path:"+path);
        var obj = spawnSync("cmd.exe",['/c',_getTfExe(),'get',path]);
        var decodeObj = _getDecodeObj(obj);
        logger.trace(decodeObj["stdout"]);
        logger.error(decodeObj["stderr"]);
        logger.info("----------tf get end -------------");
        return decodeObj;
    }



    static checkout(path){
        logger.info("----------tf checkout start -----------");
        logger.info("path:"+path);
        var statusobj = spawnSync(_getTfExe(),['status',path,'/user:'+buildConfig.hostName,'/recursive']);
        var decodeStatusobj= _getDecodeObj(statusobj);
        if(decodeStatusobj["stdout"].indexOf(helper.transferWindowPath(path))==-1){
            var obj = spawnSync(_getTfExe(),['checkout',path]);
            var decodeObj = _getDecodeObj(obj);
            logger.trace(decodeObj["stdout"]);
            logger.error(decodeObj["stderr"]);
            if(decodeObj["stderr"].indexOf("在您的工作区中未能找到项")!=-1){
                add(path);
            }
            logger.info("----------tf checkout end -------------");
            return decodeObj;
        }else{
            logger.info("no need to checkout,skip.");
            logger.info("----------tf checkout end -------------");
            return {};
        }
    }

    /**
     *
     * @param path 数组或者一条路径
     * @param comment
     * @return {*}
     */
    static checkin(path,comment){
        logger.info("----------tf checkin start -----------");
        var checkoutFileObjArr = TfOperation.statusChekoutFileObjArr();
        var checkOutpaths = [];
        for (var i = 0; i < checkoutFileObjArr.length; i++) {
            var checkoutPath = checkoutFileObjArr[i]["file"];
            checkOutpaths.push(checkoutPath);
        }

        // logger.info("path:"+path);
        // logger.info("checkOutpaths:"+checkOutpaths);
        if(Array.isArray(path)){
            for (var j = path.length-1; j >=0 ; j--) {
                var tmppath = helper.transferWindowPath(path[j]);
                if(checkOutpaths.indexOf(tmppath)==-1){
                    path.splice(j,1);
                }
            }
        }else{
            path = helper.transferWindowPath(path);
            if(checkOutpaths.indexOf(path)==-1){
                path = "";
            }
        }
        // logger.info("final checkin path:"+path);
        if(path==''||path.length==0){
            logger.info("no need to checkin,skip.");
            logger.info("----------tf checkin end -------------");
            return {"checkInPaths":[],"status":0};
        }else{
            var obj ;
            var cmdArgs = ['checkin'];
            cmdArgs = cmdArgs.concat(path);
            if(comment!=null&&comment!=""&&comment!=undefined){
                cmdArgs = cmdArgs.concat("/comment:"+comment);
            }
            obj= spawnSync(_getTfExe(),cmdArgs);
            var decodeObj = _getDecodeObj(obj);
            if(Array.isArray(path)){
                decodeObj["checkInPaths"] = path;
            }else{
                decodeObj["checkInPaths"] = [path];
            }
            logger.trace(decodeObj["stdout"]);
            logger.error(decodeObj["stderr"]);
            logger.info("----------tf checkin end -------------");
            return decodeObj;
        }
    }


    static add(path){
        logger.info("----------tf add start -----------");
        logger.info("path:"+path);
        var statusobj = spawnSync(_getTfExe(),['status',path,'/user:'+buildConfig.hostName,'/recursive']);
        var decodeStatusobj= _getDecodeObj(statusobj);
        if(decodeStatusobj["stdout"].indexOf(helper.transferWindowPath(path))==-1){
            var obj = spawnSync(_getTfExe(),['add',path]);
            var decodeObj = _getDecodeObj(obj);
            logger.trace(decodeObj["stdout"]);
            logger.error(decodeObj["stderr"]);
            logger.info("----------tf add end -------------");
            return decodeObj;
        }else{
            logger.info("no need to add,skip.");
            logger.info("----------tf add end -------------");
            return {};
        }
    }

    static statusChekoutFileObjArr(){
        var statusobj = spawnSync(_getTfExe(),['status',buildConfig.sourcePath,'/user:'+buildConfig.hostName,'/recursive']);
        var decodeStatusobj= _getDecodeObj(statusobj);
        var statusStdout = decodeStatusobj["stdout"];
        var statusStdoutArr = statusStdout.split('\n');
        helper.removeEmptyValueFromArr(statusStdoutArr);
        var resultArr = [];
        for (var i = 0; i < statusStdoutArr.length; i++) {
            var statusLine = statusStdoutArr[i];
            if(statusLine.indexOf(buildConfig.hostName)!=-1){
                var statusLineArr = statusLine.split('!');
                var statusLineInfo = statusLineArr[1];
                var statusLineInfoArr = statusLineInfo.split(' ');
                var inCheckoutFile =  statusLineInfoArr[3];
                inCheckoutFile = inCheckoutFile.replace("\n","");
                inCheckoutFile = inCheckoutFile.replace(/\s/g,"");
                var checkoutTag = statusLineInfoArr[1];
                if(checkoutTag=='编辑'){
                    resultArr.push({"file":inCheckoutFile,"tag":'change'});
                }else if(checkoutTag=='添加'){
                    resultArr.push({"file":inCheckoutFile,"tag":'add'});
                }else if(checkoutTag=='删除'){
                    resultArr.push({"file":inCheckoutFile,"tag":'unlink'});
                }
            }
        }
        return resultArr;
    }

}

function _getTfExe(){
    if(fs.existsSync(buildConfig.tfexe)){
        return buildConfig.tfexe;
    }else{
        return "tf";
    }
}

function _getDecodeObj(obj){
    return helper.getSpwanReturnDecodeObj(obj);
}

module.exports = exports = TfOperation

