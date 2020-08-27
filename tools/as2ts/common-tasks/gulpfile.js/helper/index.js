const path = require('path');
const iconv = require('iconv-lite');

/**
 * 统一路径分隔符使用 /
 * @param filePath
 */
function unionPathSeperator(filePath) {
    var resultPath = filePath.split(path.sep).join('/');
    return resultPath;
}


function unionPathSeperatorList(filePathList) {
    for (var i = 0; i < filePathList.length; i++) {
        filePathList[i] = unionPathSeperator(filePathList[i])
    }
}

function findIdxInContentArr(contentArr,key){
    for (var i = 0; i < contentArr.length; i++) {
        var line = contentArr[i];
        if(line.indexOf(key)!=-1){
            return i;
        }
    }
    return -1;
}

function grepLine(contentArr,key) {
    var idx = findIdxInContentArr(contentArr,key);
    if(idx==-1){
        return "";
    }else{
        return contentArr[idx];
    }
}


function getSpwanReturnDecodeObj(obj){
    var decodeObj = {};
    decodeObj["stdout"] = iconv.decode(obj["stdout"],'cp936');
    decodeObj["stderr"] = iconv.decode(obj["stderr"],'cp936');
    decodeObj["status"] = obj["status"];
    decodeObj["pid"] = obj["pid"];
    decodeObj["signal"] = obj["signal"];
    decodeObj["error"] = obj["error"];
    return decodeObj;
}

function uniqueArray(array) {
    var res = [];
    var sortedArray = array.concat().sort();
    var seen;
    for (var i = 0, len = sortedArray.length; i < len; i++) {
        // 如果是第一个元素或者相邻的元素不相同
        if (!i || seen !== sortedArray[i]) {
            res.push(sortedArray[i])
        }
        seen = sortedArray[i];
    }
    return res;
}

function removeEmptyValueFromArr(arr){
    for (var i = arr.length-1; i >=0 ; i--) {
        if(arr[i]==""||arr[i]==null){
            arr.splice(i,1);
        }
    }
}

function transferWindowPath(path) {
    path = path.replace(/[/]/g,"\\");
    return path;
}

function transterFlas2Swfs(flaArr){
    for (var i = 0, len = flaArr.length; i < len; i++) {
        var flaPath = flaArr[i];
        flaArr[i] = flaPath.replace(".fla",".swf");
    }
}

function checkSpwanExecSuc(returnDecodeObj) {
    if (returnDecodeObj["status"] == 0&&returnDecodeObj["stderr"] == '') {
        return true;
    }else{
        return false;
    }
}



module.exports = {
    "unionPathSeperator":unionPathSeperator,
    "transferWindowPath":transferWindowPath,

    "getSpwanReturnDecodeObj":getSpwanReturnDecodeObj,
    "findIdxInContentArr":findIdxInContentArr,
    "grepLine":grepLine,

    "uniqueArray":uniqueArray,
    "unionPathSeperatorList":unionPathSeperatorList,
    "removeEmptyValueFromArr":removeEmptyValueFromArr,
    "transterFlas2Swfs":transterFlas2Swfs,
    "checkSpwanExecSuc":checkSpwanExecSuc
}