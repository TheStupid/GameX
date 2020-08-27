var log4js = require('log4js');
// const path = require('path');
// const buildConfig = require("../buildconfig");
// const { spawnSync } = require('child_process');
// const fs = require('fs');


log4js.configure({
    appenders: {
        syncchangeset: { type: 'dateFile', filename: gitChangeSetPath+'/syncchangeset.log' ,pattern: '-yyyy-MM-dd-hh.log'},
        // watchassettask: { type: 'dateFile', filename: buildConfig.watchAssetLogPath+'/watchassettask.log' ,pattern: '-yyyy-MM-dd-hh.log'}
        },
    categories: {
        default: { appenders: ['watchassettask','syncchangeset'], level: 'ALL' },
        assetChangedLog: { appenders: ['watchassettask','syncchangeset'], level: 'ALL' }
    }
});
const logger = log4js.getLogger('default');

var colors = require('colors/safe');

// set theme
colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});

class Logger{
    constructor(){

    }
    static trace(msg){
        logger.trace(msg);
        // console.log(colors.debug(msg));
        console.log(msg);
    }
    static debug(msg){
        logger.debug(msg);
         // console.log(colors.debug(msg));
        console.log(msg);
    }
    static info(msg){
        logger.info(msg);
        // console.log(colors.info(msg));
        console.log(msg);
    }
    static warn(msg){
        logger.warn(msg);
        // console.log(colors.warn(msg));
        console.log(msg);
    }
    static error(msg){
        logger.error(msg);
        if(msg==" "||msg==null||msg==undefined){
            msg = "";
        }
        if(msg!=""){
            console.error(msg);
        }
    }
    static fatal(msg){
        logger.fatal(msg);
        // console.log(colors.error(msg));
        console.log(msg);
    }
}

module.exports = exports = {
    "logger":Logger
};
