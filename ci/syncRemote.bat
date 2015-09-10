@echo off
call %ANT_SOFTWARE%\environment.bat

set folder_local=%folder_antSoftware%\andrea.graceBI\trunk\dev
set folder_remote=\\121.199.31.4\Files\antSoftware\andrea.graceBI\trunk\dev

%tool_BCompare% %folder_local% %folder_remote%
