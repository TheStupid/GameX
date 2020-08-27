#coding=utf-8

import os
import re

exportFilePath = ""

def getDatas():
    awakeDatas = readFileAndAnalysis('E:/vstsworkspace/project2009/source/as/miraclepet/mmo/miraclepet/config/MiraclePetAwakeDataConfig.as');
    breakDatas = readFileAndAnalysis('E:/vstsworkspace/project2009/source/as/miraclepet/mmo/miraclepet/config/MiraclePetBreakDataConfig.as');
    petInfoDatas = readFileAndAnalysis('E:/vstsworkspace/project2009/source/as/miraclepet/mmo/miraclepet/config/MiraclePetInfoConfig.as');
    completeDatas = readFileAndAnalysis('E:/vstsworkspace/project2009/source/as/pet/pm/mmo/pm/data/CompleteMiralcePMDataConfig.as');
    return [awakeDatas,petInfoDatas,breakDatas,completeDatas];
    
def readFileAndAnalysis(path):
    with open(path, "r",encoding="utf-8") as f:
        itemDatas = [];
        while True:
            line = f.readline()
            if line == "":
                break
            line = line.strip();
            
            if line.find("//") >= 0:
                continue;
            
            linePattern = re.compile(r'.*\"(.+)\":.*new (\w+)\((.+)\),*')
            linePatternMatchResult = linePattern.match(line)
            if  not linePatternMatchResult is None:
                className = linePatternMatchResult.group(2);
                param = linePatternMatchResult.group(3);
                if className == "CompleteMiraclePMData":
                    splits = param.split(",");
                    param = splits[0] + "," + splits[2] + ",\"" + splits[1] + "\",6"; 
                itemDatas.append(param);
                
        f.close()
        return itemDatas;

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
    exportFilePath = path.rstrip() + '\\bin\miracledata.json'
    datas = getDatas()
    awakeDatas = datas[0];
    petInfoDatas = datas[1];
    breakDatas = datas[2];
    completeDatas = datas[3];
    
    petInfoDatas = petInfoDatas + completeDatas;
    
    content = "\"awakeData\":" + getJsonContent(awakeDatas) + ",\n";
    content += "\"petInfoData\":" + getJsonContent(petInfoDatas) + ",\n";
    content += "\"breakData\":" + getJsonContent(breakDatas) + "\n";
    content = "{\n" + content + "}";
    saveContent(content)
