#coding=utf-8

import os
import re

exportFilePath = ""

def getDatas():
    return readFileAndAnalysis('E:/vstsworkspace/project2009/source/as/interfaces/mmo/interfaces/pet/data/PetAssetsMap.as');
    
def readFileAndAnalysis(path):
    with open(path, "r",encoding="utf-8") as f:
        data = {};
        isStart = False;
        while True:
            line = f.readline()
            if line == "":
                break
            line = line.strip();
            
            if line.find("private static function init") >= 0:
                isStart = True;
                continue;
            
            linePattern = re.compile(r'raceId2FlaId\[([0-9]+)\] *= *([0-9]+);*')
            linePatternMatchResult = linePattern.match(line)
            if isStart and not linePatternMatchResult is None:
                raceIdStr = linePatternMatchResult.group(1);
                raceId = int(raceIdStr);
                viewId = int(linePatternMatchResult.group(2));
                if raceId != viewId and raceId < 10000:
                    # print("raceId:" + raceId + "=" + str(viewId));
                    data[raceIdStr] = viewId;
        f.close()
        return data;

def getJsonContent(datas):
    content = "{\n";
    for key in datas:
        content += ("\"" + key + ("\":" + str(datas[key]) + ",\n"));
    content = content[0:len(content) - 2];
    content += "\n}"
    return content;
        
def saveContent(content):
        targetFile = open(exportFilePath, 'w+', encoding='utf-8')
        targetFile.write(content)
        targetFile.close()

if __name__ == '__main__':
    path = os.path.abspath(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    exportFilePath = path.rstrip() + '\\bin\petassetsmap.json'
    datas = getDatas()
    
    content = "\"data\":" + getJsonContent(datas) + "\n";
    content = "{\n" + content + "}";
    saveContent(content)
