@echo off
e:
cd E:\vstsworkspace\projectX\source\tools\H5\common-tasks
set /p sceneFilePath=������scene�ļ�·�����ļ��л��������pages��·��:
set /p target2AssetsPath=���������sceneFilePath��·��(Ĭ��enter��):
cmd /c gulp copyRelatedRes2TargetDirectory --null --%sceneFilePath% --%target2AssetsPath%
pause
