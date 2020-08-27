#coding=utf-8

import re
import os


'''
读取Excel每个sheet的第一列和第二列的值,拼接成json串,写入文件

'''
def resolveExcel():
    # 获取excel文件
    prepareTargetFile()
    #获取一个excel有多少个sheet
    # sheetNames = list(data.sheet_names())
    # print(sheetNames)
    with open('E:/vstsworkspace/project2009/source/as/pet/pm/mmo/pm/data/PMDataList.as', "r",encoding="utf-8") as f:
        content = "{"
        blockName = ""
        blockNum = 0
        lineNum = 0;
        while True:
            line = f.readline()
            if line == "":
                break
            line = line.strip();
            blockHeadPattern = re.compile(r'public static const (\w+)\:Object\=\{.*')   # re.I 表示忽略大小写
            blockHeadMatchResult = blockHeadPattern.match(line)
            if not blockHeadMatchResult is None:
                blockName = blockHeadMatchResult.group(1)                            # 返回匹配成功的整个子串
                
                blockContent = ""
                if blockNum > 0:
                    blockContent += ",\n"
                blockContent = "\n\"" + blockName + "\":{\n"
                continue
            
            linePattern = re.compile(r'.*\"(.+)\":.*new \w+\((.+)\),*')
            linePatternMatchResult = linePattern.match(line)
            if not linePatternMatchResult is None:
                if blockName == "pmDataMap1":
                    continue
                if blockName == "pmDataMap":
                    id = int(linePatternMatchResult.group(1))
                    if id > 10000:
                        continue
                
                newLine = re.sub(r'[ \t]*new \w+\((.+)\),*',r'[\1],\n',line)
                blockContent += newLine
                lineNum += 1
                continue
            
            blockTailPattern = re.compile(r'\};')
            blockTailMatchResult = blockTailPattern.match(line)
            if not blockTailMatchResult is None:
                if lineNum > 0:
                    blockContent = blockContent[0:len(blockContent) - 2]
                blockContent += "\n},"
                content += blockContent
                
                blockNum += 1
                lineNum = 0;
                blockLines = []
                blockName = ""
                continue
        content = content[0:len(content) - 1]
        content += "\n}"
        f.close()
        
        targetFile = open(targetFilePath, 'w+', encoding='utf-8')
        targetFile.write(content)
        targetFile.close()

def prepareTargetFile():
    with open(targetFilePath, "r+",encoding="utf-8") as f:
        read_data = f.read()
        f.seek(0)
        f.truncate()   #清空文件
        
targetFilePath = ""

if __name__ == '__main__':
    path = os.path.abspath(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    targetFilePath = path.rstrip() + '\\bin\pmdatalist.json'
    print(targetFilePath)

    resolveExcel()
