#!/usr/bin/env python
#coding=utf-8

import os
import shutil
import time
import getpass
import xml.dom.minidom
import codecs
import re
import json

path = os.path.abspath(os.path.dirname(__file__))

thisDir = os.path.dirname(path).rstrip() + '\\bin\\'

with open(path+'\\mergeconfig.json',"r",encoding='utf-8') as configFile:
    a = json.load(configFile)  

operaFiles = [a["change"], a["notchange"]]
resultiles = ["change.json", "notchange.json"]
index = 0
for files in operaFiles:
    result = []
    for i in range(0, len(files)):
        file = files[i]
        with open(thisDir+file,"r",encoding='utf-8') as f:
            b = json.load(f)
            dumpsB = json.dumps(b,indent=4,ensure_ascii=False)
            dumpsB = dumpsB.replace(" ", "").replace("\n", "")
            dirName,fileName = os.path.split(f.name)
            if (i == (len(files)-1)):
                result.append('\"' + fileName + '\":' + dumpsB + '\n')
            else:
                result.append('\"' + fileName + '\":' + dumpsB + ',\n')
       
    with open(thisDir+resultiles[index],'w',encoding='utf-8') as f: 
        f.write("{")
        for item in result:   
            f.write(item) 
        f.write("}")
    index += 1

print("更新完成！")
#input()

