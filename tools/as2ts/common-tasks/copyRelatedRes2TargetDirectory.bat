@echo off
e:
cd E:\vstsworkspace\projectX\source\tools\H5\common-tasks
set /p sceneFilePath=请拖入scene文件路径或文件夹或输入相对pages的路径:
set /p target2AssetsPath=请输入相对sceneFilePath的路径(默认enter键):
cmd /c gulp copyRelatedRes2TargetDirectory --null --%sceneFilePath% --%target2AssetsPath%
pause
