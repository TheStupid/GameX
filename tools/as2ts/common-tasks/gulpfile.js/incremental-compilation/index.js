const gulp = require("gulp");
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const tsify = require("tsify");
var rename = require('gulp-rename');
const uglify = require("gulp-uglify");
const concat = require("gulp-concat");
const cached = require('gulp-cached');
const remember = require('gulp-remember');
const ts = require('gulp-typescript');
const merge = require('merge2');
const sourcemaps = require('gulp-sourcemaps');
const transform = require('vinyl-transform');
const through2 = require('through2');
const del = require('del');
const {execSync} = require('child_process');
var log = require('gulplog');
const watchify = require('watchify');
const helper = require('../helper');

const fs = require('fs');
const truncateFileOperation = require('../operations/TruncateFileOperation');
const toolConfig = require("../tool_config");

// var changeObj = {};
//
// var oneTimerObj = {};
// var oneTimer;
// var isOneTimerInit = false;


var scriptsGlob = toolConfig.sourcePath + '**/*.ts';
// var scriptsGlob = "D:/projectX-H5/src/proficient/view/UpgradeProficient.ts"

var tsProject = ts.createProject('D:/projectX-H5/tsconfig.json', {
    "noEmitHelpers": false,
    // "declaration": true,
    "preserveConstEnums": true
    // "incremental":true
    // "listFiles":true,
    // "typeRoots": ["D:/projectX-H5/libs",toolConfig.tmpJsPath]
});


gulp.task("compileTS", function () {

    // return gulp.src(scriptsGlob,{"base":toolConfig.sourcePath})
    return gulp.src(scriptsGlob)
        .pipe(cached('compileTS'))        // 只传递更改过的文件
        .pipe(sourcemaps.init()) // This means sourcemaps will be generated
        .pipe(gulp.dest(toolConfig.tmpJsPath))
        .pipe(tsProject())
        .on('error', function () {
        })
        // .pipe(sourcemaps.write())//默认会包括代码内容
        .pipe(sourcemaps.write({includeContent: true, sourceRoot: toolConfig.sourcePath}))
        // .pipe(sourcemaps.write({includeContent: false, sourceRoot: toolConfig.tmpJsPath}))
        // .pipe(sourcemaps.write('../maps',{includeContent: false,sourceRoot:toolConfig.sourcePath}))
        // .pipe(sourcemaps.write(function(sourcePath, file) {
        //     // source paths are prefixed with '../src/'
        //     console.log("sourcePath:"+sourcePath+ "file"+file.relative );
        //     return sourcePath;
        // })) // Now the sourcemaps are added to the .js file
        // .pipe(remember('compileTS'))      // 把所有的文件放回 stream
        // .pipe(browserified)
        // .pipe(concat('main.js'))
        // .pipe(rename('main.js'))
        // .pipe(uglify())
        .pipe(gulp.dest(toolConfig.tmpJsPath))
});
// var browserified = transform(function (filename) {
//     var b = browserify(filename);
//     return b.bundle();
// });
// gulp.task("compileTSWithBrowerify", function (cb) {
//     var b = browserify({
//         basedir: toolConfig.sourcePath,
//         entries: ['Main.ts'],
//         debug: true,
//         cache: {},
//         packageCache: {}
//     });
//
//     function _bundle() {
//         b.plugin(tsify, {
//             project: 'D:/projectX-H5/tsconfig.json',
//             noEmitHelpers: false
//         })
//             .bundle()
//             //使用source把输出文件命名为main.js
//             .pipe(source('main.js'))
//             //把bundle.js复制到bin/js目录
//             .pipe(gulp.dest(toolConfig.binPath + "js"));
//         if (cb) {
//             cb();
//         }
//     }
//
// // watchify defaults:
//     b.plugin(watchify, {
//         delay: 100,
//         poll: false
//     });
//
//     b.on('update', _bundle);
//     _bundle();
// });


gulp.task("bundleJs", function () {
    // del([toolConfig.tmpJsPath + "**/*.ts", !toolConfig.tmpJsPath + "**/*.d.ts"], {"force": true});
    return browserify({
        basedir: toolConfig.tmpJsPath,
        debug: true,
        entries: ['./Main.js'],
        cache: {},
        packageCache: {}
    }).bundle()
        .pipe(source('main.js'))
        .pipe(gulp.dest(toolConfig.binPath + "/js"));
});

//压缩js
gulp.task("compressJS", function () {
    return gulp.src(toolConfig.binPath + "js/main.js")
        .pipe(uglify())
        .on('error', function (err) {
            console.warn(err.toString());
        })
        .pipe(gulp.dest(toolConfig.binPath + "/js"));
});

//合并Laya库文件
gulp.task('concatLibs', function () {
    gulp.src([toolConfig.binPath + 'libs/laya.core.js',
        toolConfig.binPath + 'libs/laya.webgl.js',
        toolConfig.binPath + 'libs/laya.html.js',
        toolConfig.binPath + 'libs/laya.ui.js'])
        .pipe(uglify())//压缩
        .pipe(concat('core.js'))//输入到core.js中
        .pipe(gulp.dest(toolConfig.binPath + +"js"));//指定目录
});

function incrementalCompilation(cb) {
    var watcher = gulp.watch(scriptsGlob, gulp.series('compileTS', 'bundleJs'));
    // watcher.on('change', function (event) {
    //     if (event.type === 'deleted') {                   // 如果一个文件被删除了，则将其忘记
    //         delete cached.caches.compileTS[event.path];       // gulp-cached 的删除 api
    //         remember.forget('compileTS', event.path);         // gulp-remember 的删除 api
    //     }
    // });

    // var watcher = gulp.watch(scriptsGlob, {
    //     "delay": 500
    // });
    //
    // watcher.on('change', function (path, stats) {
    //     console.log("change path:" + path);
    //     collectFileChanges(path, stats, "change");
    // });
    //
    // watcher.on('add', function (path, stats) {
    //     console.log("add path:" + path);
    //     collectFileChanges(path, stats, "add");
    // });
    //
    // watcher.on('unlink', function (path, stats) {
    //     collectFileChanges(path, {
    //         "mode": 33206
    //     }, "unlink");
    //     delete cached.caches.compileTS[path];       // gulp-cached 的删除 api
    //     remember.forget('compileTS', path);
    // });
    if (cb) {
        cb();
    }
}

//
// function collectFileChanges(path, stats, event) {
//     if (stats != null && checkIfFileCanWrite(stats)) {
//         if (oneTimerObj[path] == null) {
//             oneTimerObj[path] = [event];
//         } else {
//             oneTimerObj[path].push(event);
//         }
//         if (!isOneTimerInit) {
//             oneTimer = setInterval(saveOneTimerObj, 500);
//             isOneTimerInit = true;
//         }
//     }
// }

// function saveOneTimerObj() {
//     for (var path in oneTimerObj) {
//         var fullPath = path;
//         var eventValue = oneTimerObj[path].join(",");
//         console.log("path:" + path + "\neventValue:" + eventValue);
//         if (eventValue == "unlink,add" || eventValue == "unlink,change") {
//             changeObj[fullPath] = "change";
//         } else if (eventValue == "add") {
//             changeObj[fullPath] = "add";
//         } else if (eventValue == "change") {
//             changeObj[fullPath] = "change";
//         } else if (eventValue == "unlink") {
//             changeObj[fullPath] = "unlink";
//         }
//     }
//     isOneTimerInit = false;
//     oneTimerObj = {};
//     clearInterval(oneTimer);
//     var changedDataLines = getCurrentChangedDataLines();
//     compileChangedTsFiles(changedDataLines);
//     // save2File();
//     changeObj = {};
// }

// function save2File() {
//     const changedFilePath = __dirname + "/changefilelist";
//     var readExistedDataLines = [];
//     if (!fs.existsSync(changedFilePath)) {
//         new truncateFileOperation(changedFilePath).execute();
//     } else {
//         readExistedDataLines = fs.readFileSync(changedFilePath, "utf8").split("\n");
//     }
//     var changedDataLines = getCurrentChangedDataLines();
//     var finalChangedDataLines = mergeChangedDataLines(changedDataLines.concat(), readExistedDataLines.concat());
//     fs.writeFileSync(changedFilePath, finalChangedDataLines.join("\n"));
//     changeObj = {};
// }
//
// var startTime;
//
// function compileChangedTsFiles(finalChangedDataLines) {
//     var pathArr = [];
//     for (var i = 0; i < finalChangedDataLines.length; i++) {
//         pathArr[i] = finalChangedDataLines[i].split("=")[0];
//     }
//     helper.unionPathSeperatorList(pathArr);
//     console.log('compiling:\n' + pathArr.join("\n"));
//     var d = new Date();
//     startTime = d.getTime();
//     gulp.src(pathArr, {
//         base: toolConfig.sourcePath
//     })
//         .pipe(sourcemaps.init()) // This means sourcemaps will be generated
//         .pipe(tsProject())
//         .on('error', function () {
//         })
//         .pipe(sourcemaps.write()) // Now the sourcemaps are added to the .js file
//         .pipe(gulp.dest(toolConfig.tmpJsPath));
//
//     // tsc --module commonjs --outDir lib --target es5 src/declarations/node.d.ts src/main/parser.ts src/main/emitter.ts src/main/command.ts src/main/aoqiH5PreHandle.ts
//
//     // for (var i = 0; i < pathArr.length; i++) {
//     //     execSync(" tsc --module commonjs --target es5 --outDir "+toolConfig.tmpJsPath+" "+pathArr[i]);
//     // }
//
//     browserify({
//         basedir: toolConfig.tmpJsPath,
//         debug: true,
//         entries: ['./Main.js'],
//         cache: {},
//         packageCache: {}
//     }).bundle()
//         .pipe(source('main.js'))
//         .pipe(gulp.dest(toolConfig.binPath + "/js"));
//
//     var d2 = new Date();
//     var needSec = (d2.getTime()-startTime)/1000;
//     console.log('compiling finish need secs:'+needSec);
//     // var task0 = gulp.task("task0");
//     // var bundleJs = gulp.task('bundleJs');
//     // task0(bundleJs);
//     // bundleJs(function () {
//
//     // });
//
//
//     // const changedFilePath = __dirname+"/changefilelist";
//     // fs.writeFileSync(changedFilePath,finalChangedDataLines.join("\n"));
// }

// function mergeChangedDataLines(changedDataLines, readExistedDataLines) {
//     for (var i = readExistedDataLines.length - 1; i >= 0; i--) {
//         var exsitedLine = readExistedDataLines[i];
//         var exsitedPath = exsitedLine.split("=")[0];
//         var exsitedEventVaule = exsitedLine.split("=")[1];
//         for (var j = changedDataLines.length - 1; j >= 0; j--) {
//             var changedLine = changedDataLines[j];
//             var changedPath = changedLine.split("=")[0];
//             var changedEventVaule = changedLine.split("=")[1];
//             var isSame = changedPath == exsitedPath;
//             var isNewAdd = exsitedEventVaule == "add";
//             if (isSame) {
//                 if (isNewAdd) {
//                     if (changedEventVaule == "unlink") {
//                         readExistedDataLines.splice(i, 1);
//                     } else {
//                         changedDataLines.splice(j, 1);
//                     }
//                 } else {
//                     readExistedDataLines.splice(i, 1);
//                 }
//                 break;
//             }
//         }
//     }
//     return changedDataLines.concat(readExistedDataLines.concat());
// }
//
// function getCurrentChangedDataLines() {
//     var results = [];
//     for (var path in changeObj) {
//         var eventValue = changeObj[path];
//         var newLine = path + "=" + eventValue;
//         results.push(newLine);
//     }
//     return results;
// }
//
//
// function checkIfFileCanWrite(stat) {
//     var unixFilePermissions = '0' + (stat.mode & 0777).toString(8);
//     // watchlogger.warn("file permission mode:"+stat.mode+" "+unixFilePermissions );
//     if (unixFilePermissions == "0666") {
//         return true;
//     } else {
//         return false;
//     }
// }


module.exports = {
    "incrementalCompilation": incrementalCompilation
}

