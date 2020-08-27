#coding=utf-8

import re
import os

def resolveFile():
    with open('E:/vstsworkspace/project2009/source/as/pet/petskillmessage/mmo/pet/petskillmessage/EggConfig.as', "r",encoding="utf-8") as f:
        content = "{\"data\":[";
        isStart = False;
        while True:
            line = f.readline()
            if line == "":
                break
            line = line.strip();
            line = line.replace(" ","");
            
            if line.find("[") >= 0:
                isStart = True;
                continue;
            
            if line.find("//") >= 0:
                continue;
            
            if line.find("];") >= 0:
                content += "]}";
                break;
            
            if isStart:
                content += line;
        f.close()
        
        targetFile = open(exportFilePath, 'w+', encoding='utf-8')
        targetFile.write(content)
        targetFile.close()
        
exportFilePath = ""

if __name__ == '__main__':
    path = os.path.abspath(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    exportFilePath = path.rstrip() + '\\bin\eggconfig.json'

    resolveFile()
