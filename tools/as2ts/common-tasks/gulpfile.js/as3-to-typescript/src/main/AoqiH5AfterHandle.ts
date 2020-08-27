import path = require('path');
import glob = require('glob');
import toolConfig = require('../../tool_config');

class AoqiH5AfterHandle {

    private static AUTO_IMPORT_CLASS_WIHT_DOT: any[];

    private _lastImportIndex: number;


    public constructor() {
        AoqiH5AfterHandle.AUTO_IMPORT_CLASS_WIHT_DOT = ["ServiceConfig","AQPanel"];
    }


    public handle(content: string, allFilesUnderSourceDir: Array<string> = null, thisFile: string = null): string {
        content = content.replace(/(function)\s*[(]{1}(.*)[)]{1}[\s\t]*([:\w]*)/g, "($2)=>");

        content = content.replace(/(for[\s\t]+\(var[\s\t]+[\w]+)[:]{0,1}[\w]+([\s\t]+in[\s\t]+[\w]+[.\w]+\))/g, "$1$2");
        content = content.replace(/(for[\s\t]+)each([\s\t]+\(var[\s\t]+[\w]+)[:\s\t\w]*([\s\t]+)in([\s\t]+[\w]+[.\w]+\))/g, "$1$2$3of$4");

        content = content.replace(/\bvar([\s\t]+)\b/g, "let$1");

        content = content.replace(/trace\s*\(/g, "console.log(");
        content = content.replace(/\bthis.console.log/g, "console.log");
        content = content.replace(/\buint.MIN_VALUE\b/g, "0");

        //AQpanel 默认加this.
        content = content.replace(/(^[\s\t]+)(show)\(/gm, "$1this.$2(");
        content = content.replace(/(^[\s\t]+)(close)\(/gm, "$1this.$2(");
        content = content.replace(/(^[\s\t]+)(addStrategy)\(/gm, "$1this.$2(");
        content = content.replace(/(^[\s\t]+)(regClickFunc)\(/gm, "$1this.$2(");
        content = content.replace(/(^[\s\t]+)(setText)\(/gm, "$1this.$2(");
        content = content.replace(/(^[\s\t]+)(setVisible)\(/gm, "$1this.$2(");
        content = content.replace(/(^[\s\t]+)(setFrame)\(/gm, "$1this.$2(");
        content = content.replace(/(^[\s\t]+)(setArtNum)\(/gm, "$1this.$2(");
        content = content.replace(/(^[\s\t]+)(setSize)\(/gm, "$1this.$2(");
        content = content.replace(/(^[\s\t]+)(setPos)\(/gm, "$1this.$2(");
        content = content.replace(/(^[\s\t]+)(setScale)\(/gm, "$1this.$2(");
        content = content.replace(/(^[\s\t]+)(setMouseState)\(/gm, "$1this.$2(");
        content = content.replace(/(^[\s\t]+)(setEnabled)\(/gm, "$1this.$2(");

        content = content.replace(/(^[\s\t]+)(setButtonMode)\(/gm, "$1this.$2(");
        content = content.replace(/(^[\s\t]+)(setRotation)\(/gm, "$1this.$2(");
        content = content.replace(/(^[\s\t]+)(setAlpha)\(/gm, "$1this.$2(");
        content = content.replace(/(^[\s\t]+)(setProperties)\(/gm, "$1this.$2(");
        content = content.replace(/(^[\s\t]+)(setAsBitmap)\(/gm, "$1this.$2(");
        content = content.replace(/(^[\s\t]+)(setTips)\(/gm, "$1this.$2(");

        content = content.replace(/(^[\s\t]+)(setAnything)\(/gm, "$1this.$2(");
        content = content.replace(/(^[\s\t]+)(enabledThrowError)\(/gm, "$1this.$2(");
        content = content.replace(/(^[\s\t]+)(setTheChild)\(/gm, "$1this.$2(");
        content = content.replace(/(^[\s\t]+)(iHelper)\(/gm, "$1this.$2(");
        content = content.replace(/(^[\s\t]+)(tHelper)\(/gm, "$1this.$2(");

        content = content.replace(/(^[\s\t]+)(getChild)\(/gm, "$1this.$2(");

        //不支持look behind，所以先把this.getChild(" 替换成 getChild(" 再统一加this.
        content = content.replace(/this.(getChild\(")/g, "$1");
        content = content.replace(/(getChild\(")/g, "this.$1");

        // content = content.replace(/(?<!this\.)(getChild\(")/g, "$1this.$2(");

        content = content.replace(/(super.setComponents\()([A-Z_]+\))/, "$1AQPanel.$2");

        content = content.replace(/Dictionary<anythis.this.,this.any> this./, "Dictionary<any,any>");

        let insertStr = function (soure, start, newStr): string {
            return soure.slice(0, start) + newStr + soure.slice(start)
        };


        //如果存在某个文件夹下的文件数组，尝试import同层次的文件
        let importClassArr: Array<string> = new Array<string>();
        if (allFilesUnderSourceDir != null && allFilesUnderSourceDir.length > 0) {
            importClassArr = this.findAllImportClass(content);
            // console.log("importClassArr:" + importClassArr.join(","));
            let usedFiles: Array<string> = this.findTheFilesThatUsed(content, allFilesUnderSourceDir);
            // console.log("usedFiles:" + usedFiles.join(","));
            let usedButNotImportFiles: Array<string> = new Array<string>();
            usedFiles.forEach((file: string, index: number, arr) => {
                if (!this.checkFileIsInImport(file, importClassArr) && thisFile != file) {
                    usedButNotImportFiles.push(file);
                }
            })
            // console.log("usedButNotImportFiles:" + usedButNotImportFiles.join(","));
            let extraImportStr = "";
            usedButNotImportFiles.forEach((file: string, index: number, arr) => {
                let fileName: string = path.basename(file, ".as");
                let relativeFilePath = path.relative(path.dirname(thisFile), file);
                relativeFilePath = relativeFilePath.replace(/\\/g, "/");
                relativeFilePath = relativeFilePath.replace(".ts", "");
                relativeFilePath = relativeFilePath.replace(".as", "");
                if (relativeFilePath.indexOf("..") == -1) {
                    relativeFilePath = "import " + fileName + " from \"./" + relativeFilePath + "\";\n";
                } else {
                    relativeFilePath = "import " + fileName + " from \"" + relativeFilePath + "\";\n";
                }
                console.log("auto import same level file:" + relativeFilePath);
                importClassArr.push(fileName);
                extraImportStr += relativeFilePath
            })

            content = insertStr(content, this._lastImportIndex, extraImportStr);
        }

        //找出那些ServiceConfig.类似的 词组 ，如果不存在import ,尝试import
        let allUsedClassWithDot: Array<string> = this.findAllUsedClassWithDot(content);
        allUsedClassWithDot.forEach((className: string, index: number, arr) => {
            if (AoqiH5AfterHandle.AUTO_IMPORT_CLASS_WIHT_DOT.indexOf(className) != -1 && !this.checkFileIsInImport(className, importClassArr)) {
                let exsitsFileNames = glob.sync('**/' + className + '+(.ts|.as)', {
                    "cwd": path.join(toolConfig.sourcePath),
                    "nodir": true
                });
                if (exsitsFileNames.length > 0) {
                    let relativeFilePath: string = this.findTheNearestClass(exsitsFileNames, thisFile);
                    relativeFilePath = relativeFilePath.replace(/\\/g, "/");
                    relativeFilePath = relativeFilePath.replace(".ts", "");
                    relativeFilePath = relativeFilePath.replace(".as", "");
                    if (relativeFilePath.indexOf("..") == -1) {
                        relativeFilePath = "import " + className + " from \"./" + relativeFilePath + "\";\n";
                    } else {
                        relativeFilePath = "import " + className + " from \"" + relativeFilePath + "\";\n";
                    }
                    console.log("auto import path:" + className);
                    content = insertStr(content, this._lastImportIndex, relativeFilePath);
                    importClassArr.push(className);
                }
            }
        })
        return content;
    }

    //import StringUtil from "../../../util/StringUtil";
    //return [StringUtil]
    private findAllImportClass(content: string): Array<string> {
        let importClassArr: Array<string> = new Array<string>();
        let re: RegExp = /import[\s\t]+[{]{0,1}(\w+)[}]{0,1}[\s\t]+from/g;
        let result: RegExpExecArray | null;
        while ((result = re.exec(content)) != null) {
            if (result[1] != "") {
                importClassArr[result.index] = result[1];
            }
        }
        this._lastImportIndex = re.lastIndex;
        return importClassArr;
    }

    private findTheFilesThatUsed(content: string, allFilesUnderSourceDir: Array<string>): Array<string> {
        let usedFiles: Array<string> = new Array<string>();
        allFilesUnderSourceDir.forEach((file: string, index, arr) => {
            let fileName: string = path.basename(file, ".as");
            let reg: RegExp = new RegExp("\\b" + fileName + "\\b" + "[.]{0,1}", "g");
            if (content.match(reg) != null) {
                usedFiles.push(file);
            }
        })

        return usedFiles;
    }

    private checkFileIsInImport(file: string, importClassArr: Array<string>): boolean {
        let fileName: string = path.basename(file, ".as");
        return importClassArr.indexOf(fileName) != -1;
    }

    private findAllUsedClassWithDot(content: string): Array<string> {
        let importClassArr: Array<string> = new Array<string>();
        let re: RegExp = /(\b[A-Z]{1}\w+\b)[.]{1}/g;
        let result: RegExpExecArray | null;
        while ((result = re.exec(content)) != null) {
            importClassArr[result.index] = result[1];
        }
        return importClassArr;
    }


    private findTheNearestClass(exsitsFileNames, thisFile): string {
        let relativeFilePaths = [];
        exsitsFileNames.forEach((fileName, index: number, arr) => {
            relativeFilePaths[index] = path.relative(path.dirname(thisFile), path.join(toolConfig.sourcePath, fileName));
        })
        relativeFilePaths.sort((a: string, b: string) => {
            if (a.length == b.length) {
                return 0;
            } else if (a.length < b.length) {
                return -1;
            } else {
                return 0;
            }
        })
        return relativeFilePaths[0];
    }

}

export = AoqiH5AfterHandle;