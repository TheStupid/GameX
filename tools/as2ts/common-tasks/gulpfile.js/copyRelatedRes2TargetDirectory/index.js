const fs = require("fs");
const toolConfig = require("../tool_config");
const underscoreString = require("underscore.string");
const path = require("path");
const spawnSync = require("child_process").spawnSync;
const helper = require("../helper");

/**
 * @param cb 完成任务的回调
 * @param sceneFilePath  文件夹或者文件eg：D:/projectX-H5/laya/pages/proficient/res/SelectPanel.scene
 * @param target2AssetsPath 相对于sceneFilePath
 */
function copyRelatedRes2TargetDirectory(cb, sceneFilePath, target2AssetsPath) {
    sceneFilePath = helper.unionPathSeperator(sceneFilePath);

    if (sceneFilePath.indexOf(toolConfig.pagesPath) == -1) {
        sceneFilePath = path.join(toolConfig.pagesPath, sceneFilePath);
    }

    target2AssetsPath = helper.unionPathSeperator(target2AssetsPath);
    var targetDirName;
    if (fs.statSync(sceneFilePath).isDirectory()) {
        if (target2AssetsPath != null && target2AssetsPath.length > 0) {
            throw new Error("target2AssetsPath must be null or empty,when sceneFilePath is a  directory!");
        }
        var files = readdir(sceneFilePath, sceneFilePath).filter(function (file) {
            return /.scene$/.test(file)
        });
        var number = 1;
        var length = files.length;
        var tmpTargetPath;
        files.forEach(function (file) {
            console.log('handling \'' + file + '\' ' + number + '/' + length);
            targetDirName = path.dirname(file);
            targetDirName = targetDirName.replace("pages", "assets");
            tmpTargetPath = path.join(targetDirName, target2AssetsPath);
            tmpTargetPath = helper.unionPathSeperator(tmpTargetPath);
            _handleOneSceneFile(file, tmpTargetPath);
            number++;
        });
    } else {
        console.log('handling \'' + sceneFilePath + '\' ' + 1 + '/' + 1);
        targetDirName = path.dirname(sceneFilePath);
        targetDirName = targetDirName.replace("pages", "assets");
        target2AssetsPath = path.join(targetDirName, target2AssetsPath);
        target2AssetsPath = helper.unionPathSeperator(target2AssetsPath);
        _handleOneSceneFile(sceneFilePath, target2AssetsPath);
    }

    if (cb) {
        cb();
    }
}

function flatten(arr) {
    return arr.reduce(function (result, val) {
        if (Array.isArray(val)) {
            result.push.apply(result, flatten(val));
        } else {
            result.push(val);
        }
        return result;
    }, []);
}

function readdir(dir, prefix) {
    if (!prefix) {
        prefix = "";
    }
    return flatten(fs.readdirSync(dir).map(function (file) {
        var fileName = path.join(prefix, file);
        var filePath = path.join(dir, file);
        return fs.statSync(filePath).isDirectory() ? readdir(filePath, fileName) : fileName;
    }));
}

function _handleOneSceneFile(sceneFilePath, target2AssetsPath) {
    var sceneContent = JSON.parse(fs.readFileSync(sceneFilePath, "utf8"));
    _handleOneChildNode(sceneContent, target2AssetsPath);
    fs.writeFileSync(sceneFilePath, JSON.stringify(sceneContent, null, 4), "utf8");
}

function _handleOneChildNode(node, target2AssetsPath) {
    _handleOnProps(node, "skin", target2AssetsPath);
    _handleOnProps(node, "texture", target2AssetsPath);
    _handleButtonNode(node);
    if (node.hasChild) {
        var child = node.child;
        for (var i = 0; i < child.length; i++) {
            var childNode = child[i];
            _handleOneChildNode(childNode, target2AssetsPath);
        }
    }
}

function _handleButtonNode(node) {
    var props = node["props"];
    if (props["stateNum"] == "1" && node["type"] == "Button") {
        props["runtime"] = "common/component/CustomButton.ts";
    }
}

function _handleOnProps(node, key, target2AssetsPath) {
    var props = node["props"];
    if (!underscoreString.isBlank(props[key])) {
        console.log("key:" + key + " " + props[key])
        // _art/petpackage/potential/potential_bg.jpg
        var extName = path.extname(props[key]);
        var fileName = path.basename(props[key], extName);
        var targetFilePath = target2AssetsPath + "/" + fileName;
        // new TruncateFileOperation(toolConfig.assetsPath+target2AssetsPath+"/test.txt").execute();
        var returnDecodeObj = _copyFile(helper.transferWindowPath(toolConfig.assetsPath + props[key]), helper.transferWindowPath(targetFilePath) + extName);
        var extraFileSuffixes = _getSpecailBarNodeExtraCopyFileSuffixes(node);
        extraFileSuffixes.forEach(function (suffix, index, arr) {
            var sourceExtraFileName = path.join(path.dirname(toolConfig.assetsPath + props[key]), fileName);
            sourceExtraFileName = sourceExtraFileName + suffix + extName;
            _copyFile(helper.transferWindowPath(sourceExtraFileName), helper.transferWindowPath(targetFilePath + suffix + extName));
        });
        // console.log("stdout:"+returnDecodeObj["stdout"]);
        console.log("stderr:" + returnDecodeObj["stderr"]);
        // fs.copyFileSync(toolConfig.assetsPath+props.skin,toolConfig.assetsPath+targetFilePath);
        // fs.unlinkSync(toolConfig.assetsPath+target2AssetsPath+"/test.txt");

        var relativeTargetPath = targetFilePath.replace(toolConfig.assetsPath, "");
        props[key] = relativeTargetPath + extName;
    }
}

function _getSpecailBarNodeExtraCopyFileSuffixes(node) {
    if (node["type"] == "ProgressBar") {
        return ["$bar"];
    } else if (node["type"] == "ScrollBar") {
        return ["$bar", "$down", "$up"];
    } else if (node["type"] == "Slider") {
        return ["$bar"];
    } else {
        return [];
    }
}

function _copyFile(sourcePath, destPath) {
    if (sourcePath == destPath) {
        return {};
    }
    var args = ['/c', 'echo f|XCOPY', sourcePath, destPath, '/s', '/e', '/h', '/r', '/v', '/k', '/y', '/d', '/f'];
    var returnObj = spawnSync("cmd.exe", args);
    console.log("args:" + args);
    var returnDecodeObj = helper.getSpwanReturnDecodeObj(returnObj);
    return returnDecodeObj;
}

module.exports = {
    "copyRelatedRes2TargetDirectory": copyRelatedRes2TargetDirectory
}
