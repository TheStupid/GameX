#coding=utf-8

import os
import re

exportFilePath = ""

def getTaskOrderData():
    datas = analyzTaskOrder('E:/vstsworkspace/project2009/source/as/task/mmo/taskdefines/TaskOrder.as');
    return datas;

def getTaskDefineData():
    datas = analyzTaskDefine('E:/vstsworkspace/project2009/source/as/task/mmo/taskdefines/TaskDefines.as');
    return datas;

def analyzTaskDefine(path):
    with open(path, "r",encoding="utf-8") as f:
        defineDatas = [];
        defines = {};
        starters = {};
        isParseDefine = False;
        isParseStarter = False;
        while True:
            line = f.readline()
            if line == "":
                break
            line = line.strip();
            
            if line.find("public static const defines") >= 0:
                isParseDefine = True;
                continue;
            
            linePattern = re.compile(r'.*\"(.+)\":.*new TaskDefine\((.+)\),*')
            linePatternMatchResult = linePattern.match(line)
            if isParseDefine and not linePatternMatchResult is None:
                key = linePatternMatchResult.group(1);
                value = linePatternMatchResult.group(2);
                defaultPattern = re.compile(r'.*\"(.+)\":.*new TaskDefine\(\d+, *11 *, *\" *\"\),*')#去掉默认配置
                defaultPatternMatchResult = defaultPattern.search(line)
                if defaultPatternMatchResult is None:
                    defines[key] = value.replace(" ","");
                
            if line.find("public static const starters") >= 0:
                isParseStarter = True;
                continue;
            
            linePattern = re.compile(r'.*\"(.+)\":.*new TaskStarter\((.+),*\)')
            linePatternMatchResult = linePattern.search(line)
            if isParseStarter and not linePatternMatchResult is None:
                key = linePatternMatchResult.group(1);
                value = linePatternMatchResult.group(2);
                starters[key] = value.replace(" ","");
                    
        f.close()
        defineDatas.append(defines);
        defineDatas.append(starters);
        return defineDatas;
    
def analyzTaskOrder(path):
    with open(path, "r",encoding="utf-8") as f:
        datas = [[],[],[],[]];
        parsingOrderIndex = -1;
        while True:
            line = f.readline()
            if line == "":
                break
            line = line.strip();
            
            if line.find("public static const BIG_TITLES") >= 0:
                parsingOrderIndex = 0;
                continue;
            
            if line.find("public static const SUB_TITLES") >= 0:
                parsingOrderIndex = 1;
                continue;
            
            if line.find("public static const AREA_NAME_AND_ID") >= 0:
                parsingOrderIndex = 2;
                continue;
            
            if line.find("public static const taskOrderInArea1") >= 0:
                parsingOrderIndex = 3;
            
            linePattern = re.compile(r'(\{.+\})')
            linePatternMatchResult = linePattern.search(line)
            if parsingOrderIndex >= 0 and not linePatternMatchResult is None:
                value = linePatternMatchResult.group(1);
                datas[parsingOrderIndex].append(value);
                    
        f.close()
        return datas;

# def getItemId(data):
#     return data.split(",")[0];

def ConvertObject2JsonContent(data):
    content = "{\n";
    for key in data:
        content += ("\"" + key + ("\":[" + data[key] + "],\n"));
    content = content[0:len(content) - 2];
    content += "\n}"
    return content;


def ConvertArray2JsonContent(data):
    content = "[\n";
    for value in data:
        content += value + ",\n";
    content = content[0:len(content) - 2];
    content += "\n]"
    return content;
        
def saveContent(content):
        targetFile = open(exportFilePath, 'w+', encoding='utf-8')
        targetFile.write(content)
        targetFile.close()

if __name__ == '__main__':
    path = os.path.abspath(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    exportFilePath = path.rstrip() + '\\bin\\taskdata.json'

    defineDatas = getTaskDefineData()
    defines = defineDatas[0];
    starters = defineDatas[1];
    
    orderDatas = getTaskOrderData();
    bitTitle = orderDatas[0];
    subTitle = orderDatas[1];
    areaConfig = orderDatas[2];
    orderInArea = orderDatas[3];
    
    content = "\"defines\":" + ConvertObject2JsonContent(defines) + ",\n";
    content += "\"starters\":" + ConvertObject2JsonContent(starters) + ",\n";
    content += "\"bitTitle\":" + ConvertArray2JsonContent(bitTitle) + ",\n";
    content += "\"subTitle\":" + ConvertArray2JsonContent(subTitle) + ",\n";
    content += "\"areaConfig\":" + ConvertArray2JsonContent(areaConfig) + ",\n";
    content += "\"orderInArea\":" + ConvertArray2JsonContent(orderInArea) + "\n";
    content = "{\n" + content + "}";
    saveContent(content)
