const fs = require('fs');
const readline = require('readline');
const {logger} = require('../logger');

class ReadFileByLinesOperation{
    constructor(){

    }

    /**
     * @param fReadName
     * @param callback args:[]
     */
    readFileToArr(fReadName,callback,thisObj){
        logger.info("----------read file: "+fReadName+" start -----------");
        var fRead = fs.createReadStream(fReadName);
        var objReadline = readline.createInterface({
            input:fRead
        });
        var arr = new Array();
        objReadline.on('line',function (line) {
            arr.push(line);
        });
        objReadline.on('close',function () {
            // logger.data("the content is:\n"+arr.join("\n"));
            logger.info("----------read file: "+fReadName+" end -----------");
            callback.apply(thisObj,[arr]);
        });
    }
}

module.exports = exports = ReadFileByLinesOperation;