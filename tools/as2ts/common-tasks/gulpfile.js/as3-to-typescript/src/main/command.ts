/*jshint node:true*/

import AS3Parser = require('./parser');
import emitter = require('./emitter');
import fs = require('fs');
import path = require('path');
import AoqiH5PreHandle = require('./aoqiH5PreHandle');
import toolConfig = require('../../tool_config');
import aoqiH5AfterHandle = require("./aoqiH5AfterHandle");
import AoqiH5AfterHandle = require("./AoqiH5AfterHandle");

require('fs-extended')


var rimraf = require('rimraf');


function flatten<T>(arr: any): T[] {
  return arr.reduce(function (result: T[], val: any) {
    if (Array.isArray(val)) {
      result.push.apply(result, flatten(val));
    } else {
      result.push(val);
    }
    return result;
  }, <T[]>[]);
}

function readdir(dir: string, prefix = ''): string[] {
    return flatten<string>(fs.readdirSync(dir).map(function (file) {
        var fileName = path.join(prefix, file);
        var filePath = path.join(dir, file);
        return fs.statSync(filePath).isDirectory() ? <any> readdir(filePath, fileName) : <any> fileName;
    }));
}

function displayHelp() {
    console.log('usage: as3-to-typescript <sourceDir> <outputDir>             when accept two arg,must be directory.');
    console.log('usage: as3-to-typescript <sourceDir>|<sourceFile>            when accecpt one arg,it can be directory or file.');
}

function handleTwoArg() {
    var sourceDir = path.resolve(process.cwd(), process.argv[2]);
    if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
        throw new Error('invalid source dir');
    }

    var outputDir = path.resolve(process.cwd(), process.argv[3]);
    if (fs.existsSync(outputDir)) {
        if (!fs.statSync(outputDir).isDirectory()) {
            throw new Error('invalid ouput dir');
            process.exit(1)
        }
        rimraf.sync(outputDir);
    }
    fs.mkdirSync(outputDir);

    var files = readdir(sourceDir,sourceDir).filter(file => /.as$/.test(file));
    var number = 0;
    var length = files.length;
    files.forEach(function (file) {
        // file = path.join(sourceDir,file);
        console.log('compiling \'' + file + '\' ' + number + '/' + length);
        handleOneAsFile(file,sourceDir,outputDir,false);
        number ++;
    });
}

function handleOneAsFile(file,sourceDir,outputDir,isDeleteAsFileAfterOutPut,allFilesUnderSourceDir:Array<string>=null) {
    if(isDeleteAsFileAfterOutPut==undefined||isDeleteAsFileAfterOutPut==null){
        isDeleteAsFileAfterOutPut = false;
    }
    var parser = new AS3Parser();
    var content = fs.readFileSync(path.resolve(sourceDir, file), 'UTF-8');
    var aoqiPreHandle = new AoqiH5PreHandle();
    console.log('prehandling for aoqi h5');
    content = aoqiPreHandle.handle(content);
    console.log('parsing');
    var ast = parser.buildAst(path.basename(file), content);
    console.log('emitting');
    var outPutContent:string = emitter.emit(ast, content,file);
    var aoqiAfterHandle = new AoqiH5AfterHandle();
    outPutContent = aoqiAfterHandle.handle(outPutContent,allFilesUnderSourceDir,file);
    (<any>fs).createFileSync(path.resolve(outputDir, file.replace(/.as$/, '.ts')),outPutContent );

    if(isDeleteAsFileAfterOutPut){
        rimraf.sync(path.resolve(sourceDir, file));
    }
}

function handleOneArg() {
    var sourceDir = path.resolve(process.cwd(), process.argv[2]);
    if (!fs.existsSync(sourceDir)) {
        throw new Error('invalid source dir');
    }
    var outputDir;
    if(fs.statSync(sourceDir).isDirectory()){
        outputDir = sourceDir;
        var files = readdir(sourceDir,sourceDir).filter(file => /.as$/.test(file));
        var number = 0;
        var length = files.length;
        files.forEach(function (file) {
            // file = path.join(sourceDir,file);
            console.log('compiling \'' + file + '\' ' + number + '/' + length);
            handleOneAsFile(file,sourceDir,outputDir,true,files);
            number ++;
        });
    }else{
        var file = sourceDir;
        var sourceDiretory = path.dirname(sourceDir);
        outputDir = sourceDiretory;
        if(path.extname(file)==".as"){
            console.log('compiling \'' + file + '\' ' + number + '/' + 1);
            handleOneAsFile(file,sourceDiretory,outputDir,true);
        }else{
            throw new Error('not as file!');
        }
    }
}

export function run() {
    if (process.argv.length === 2) {
        displayHelp();
        process.exit(0);
    }
    if (process.argv.length > 4) {
        throw new Error('source dir and output dir are mandatory');
        process.exit(1)
    }
    if(process.argv.length==4){
        handleTwoArg();
    }if(process.argv.length==3){
        handleOneArg();
    }
}

