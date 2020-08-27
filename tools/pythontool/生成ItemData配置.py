#coding=utf-8

import os
import re

exportFilePath = ""

def getDatas():
    itemDatas = readFileAndAnalysis('E:/vstsworkspace/project2009/source/as/materialdata/mmo/materialdata/ItemData.as');
    randomDatas = readFileAndAnalysis('E:/vstsworkspace/project2009/source/as/materialdata/mmo/materialdata/RandomMaterialData.as');
    itemDatas.extend(randomDatas);
    return itemDatas;

def readPetItemDataAndAnalysis():
    with open('E:/vstsworkspace/project2009/source/as/pet/petitem/mmo/pet/petitem/PetItemSortMap.as', "r",encoding="utf-8") as f:
        datas = [];
        isStart = False;
        hasReadEdgeChar = False;
        isJustGetInBlock = True;
        blockIndex = -1;
        arr = [];
        while True:
            line = f.readline()
            if line == "":
                break
            line = line.strip();
            
            if line.find("public static const ITEMS_ARRAY") >= 0:
                isStart = True;
                continue;
            
            if not isStart:
                continue;
            
            linePattern = re.compile(r'[\[\]]')
            linePatternMatchResult = linePattern.match(line)
            if not linePatternMatchResult is None:
                hasReadEdgeChar = True;
                isJustGetInBlock = True;
                
            linePattern = re.compile(r'([0-9]+)')
            linePatternMatchResult = linePattern.match(line)
            if not linePatternMatchResult is None:
                if isJustGetInBlock:
                    if blockIndex >= 0:
                        datas.append(arr);
                    isJustGetInBlock = False;
                    blockIndex += 1; 
                    arr = [];
                id = int(linePatternMatchResult.group(1));
                arr.append(id);
        datas.append(arr);
        f.close()
        return datas;
    
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
            
            linePattern = re.compile(r'.*\"(.+)\":.*new Item\((.+)\),*')
            linePatternMatchResult = linePattern.match(line)
            if isStart and not linePatternMatchResult is None:
                param = linePatternMatchResult.group(2);
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

def getPetItemContent(datas):
    content = "[\n";
    for data in datas:
        content += (str(data) + ",\n");
    content = content[0:len(content) - 2];
    content += "\n]"
    return content;
        
def saveContent(content):
        targetFile = open(exportFilePath, 'w+', encoding='utf-8')
        targetFile.write(content)
        targetFile.close()

if __name__ == '__main__':
    path = os.path.abspath(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    exportFilePath = path.rstrip() + '\\bin\itemdata.json'
    itemDatas = getDatas()
    
    petItemDatas = readPetItemDataAndAnalysis();
    
    content = "\"data\":" + getJsonContent(itemDatas) + ",\n";
    content += "\"petitem\":" + getPetItemContent(petItemDatas) + "\n";
    content = "{\n" + content + "}";
    saveContent(content)
