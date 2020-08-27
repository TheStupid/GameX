#coding=utf-8

import os
import re

exportFilePath = ""

def getDatas():
    itemDatas = readFileAndAnalysis('E:/vstsworkspace/project2009/source/as/materialdata/mmo/materialdata/ClothesData.as');
    return itemDatas;
    
def readFileAndAnalysis(path):
    with open(path, "r",encoding="utf-8") as f:
        datas = [];
        suitDatas = [];
        isStart = False;
        isStartSuit = False;
        while True:
            line = f.readline()
            if line == "":
                break
            line = line.strip();
            if line.find("//") >= 0:
                continue;
#            line.replace("•", "·")
            if line.find("public static const data") >= 0:
                isStart = True;
                continue;
            if line.find("public static const suit") >= 0:
                isStartSuit = True;
                continue;

            linePattern = re.compile(r'.*\"(.+)\":.*new Clothes\((.+)\),*')
            linePatternMatchResult = linePattern.match(line)
            if isStart and not linePatternMatchResult is None:
                param = linePatternMatchResult.group(2);
#                param = param.replace("InscriptionType.INCREASE_ATTRIBUTE","0");
#                param = param.replace("InscriptionType.SPECIAL_EFFECT","1");
                datas.append(param);

            if isStartSuit:
                if line.find("new ClothesSuit") != -1:
                    line = line + f.readline() + f.readline();
                    line = line.strip();
                    line = line.replace("\n", "").replace(" ", "")
                    linePattern = re.compile(r'.*\"(.+)\":.*newClothesSuit\((.+)\),*')
                    linePatternMatchResult = linePattern.match(line)
                    if linePatternMatchResult != None:
                        param = linePatternMatchResult.group(2);
                        suitDatas.append(param);
        f.close()
        return [datas,suitDatas];

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
    exportFilePath = path.rstrip() + '\\bin\clothesdata.json'
    print(exportFilePath)

    datas = getDatas()     
    itemDatas = datas[0]
    suitDatas = datas[1]
    content = "\"data\":" + getJsonContent(itemDatas) + ",\n";
    content += "\"suit\":" + getJsonContent(suitDatas) + "\n";
    content = "{\n" + content + "}";

    saveContent(content)
