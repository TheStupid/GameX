#coding=utf-8

import os
import re
        
exportFilePath = ""
levelUpIdsOfCard = {};
levelUpIds2OriginIds = {};

def getDatas():
    with open('E:/vstsworkspace/project2009/source/as/materialdata/mmo/materialdata/PetCardData.as', "r",encoding="utf-8") as f:
        cardDatas = [];
        suitDatas = [];
        isStart = False;
        while True:
            line = f.readline()
            if line == "":
                break
            line = line.strip();
            
            if line.find("public static const data") >= 0:
                isStart = True;
                continue;
            
            linePattern = re.compile(r'.*\"(.+)\":.*new PetCard\((.+)\),*')
            linePatternMatchResult = linePattern.match(line)    
            if isStart and not linePatternMatchResult is None:
                param = linePatternMatchResult.group(2);
                cardId = getCardId(param)
                levelUpId = getLevelUpId(param);
                levelUpIdsOfCard[cardId] = levelUpId;
                if int(levelUpId) > 0:
                    levelUpIds2OriginIds[levelUpId] = cardId;
                cardDatas.append(param);
            
            linePattern = re.compile(r'.*\"(.+)\":.*new PetCardSuit\((.+)\),*')
            linePatternMatchResult = linePattern.match(line)    
            if isStart and not linePatternMatchResult is None:
                param = linePatternMatchResult.group(2);
                suitDatas.append(param);
                
        f.close()
        return [cardDatas,suitDatas];

def addOriginCardId(datas):
    originCardIds = {};
    for data in datas:
        cardId = getCardId(data)
        originCardId = getOriginCardId(datas,cardId);
        originCardIds[cardId] = originCardId;
    
    for index in range(len(datas)):
        data2 = datas[index]
        cardId2 = getCardId(data2)
        datas[index] = (data2 + "," + originCardIds[cardId2]);
    
def getOriginCardId(datas,id):
    if id in levelUpIds2OriginIds.keys():
        preId = levelUpIds2OriginIds[id];
        if int(preId) > 0:
            return getOriginCardId(datas,preId);
    return id;

def getLevelUpId(data):
    tailStr = data.split("\",")[2];
    if tailStr.find(",\"") >= 0:
        ary = tailStr.split(",\"")[0].split(",");
        return ary[len(ary) - 1];
    else:
        ary = tailStr.split(",");
        return ary[len(ary) - 2];

def getCardId(data):
    return data.split(",")[0];

def getJsonContent(datas):
    content = "{\n";
    for data in datas:
        id = getCardId(data)
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
    exportFilePath = path.rstrip() + '\\bin\petcarddata.json'

    datas = getDatas()
    cardDatas = datas[0];
    suitDatas = datas[1];
    
    addOriginCardId(cardDatas)
    cardContent = "\"data\":" + getJsonContent(cardDatas) + ",\n";
    
    suitContent = "\"suit\":" + getJsonContent(suitDatas);
    
    content = "{" + cardContent + suitContent + "\n}";
    
    saveContent(content)
