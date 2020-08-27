from os import path
from os import listdir
import os


path = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
path = path.rstrip() + '\\tools\pythontool'

for root, dirs,files in os.walk(path):
    for f in files:
        print(f)
        if os.path.splitext(f)[1] == '.py':
            os.system('python ' + root +'\\' + f)
