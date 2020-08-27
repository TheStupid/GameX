#coding=utf-8

import os
import re

exportFilePath = ""

def getDatas():
    itemDatas = readFileAndAnalysis('E:/vstsworkspace/project2009/source/as/materialdata/mmo/materialdata/InscriptionData.as');
    return itemDatas;
    
def readFileAndAnalysis(path):
    with open(path, "r",encoding="utf-8") as f:
        datas = [];
        isStart = False;
        while True:
            line = f.readline()
            if line == "":
                break
            line = line.strip();
            
            if line.find("public static const data") >= 0:
                isStart = True;
                continue;
            
            linePattern = re.compile(r'.*\"(.+)\":.*new Inscription\((.+)\),*')
            linePatternMatchResult = linePattern.match(line)
            if isStart and not linePatternMatchResult is None:
                param = linePatternMatchResult.group(2);
                param = param.replace("InscriptionType.INCREASE_ATTRIBUTE","0");
                param = param.replace("InscriptionType.SPECIAL_EFFECT","1");
                datas.append(param);
                
        f.close()
        return datas;

def getItemId(data):
    return data.split(",")[0];

def getJsonContent(datas):
    content = "{\n";
    for data in datas:
        id = getItemId(data)
        content += ("\"" + id + ("\":[" + data + "],\n"));
    content = content[0:len(content) - 2];
    content += "\n}"
    return content;
        
def saveContent(content):
        targetFile = open(exportFilePath, 'w+', encoding='utf-8')
        targetFile.write(content)
        targetFile.close()

if __name__ == '__main__':
    path = os.path.abspath(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    exportFilePath = path.rstrip() + '\\bin\inscriptiondata.json'

    datas = getDatas()
        
    content = "\"data\":" + getJsonContent(datas) + "\n";
    content = "{\n" + content + "}";
    saveContent(content)


