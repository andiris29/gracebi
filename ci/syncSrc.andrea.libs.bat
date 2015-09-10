@echo off
call %ANT_SOFTWARE%\environment.bat

set folder_local=%folder_antSoftware%\andrea.graceBI\trunk\dev
set folder_remote=\\121.199.31.4\Files\graceBI

%tool_BCompare% %folder_local%\client\FileAccessor\srcIris %folder_antSoftware%\andrea.libs.iris\trunk\dev\src
%tool_BCompare% %folder_local%\client\CrossDomainAccessor\srcIris %folder_antSoftware%\andrea.libs.iris\trunk\dev\src
%tool_BCompare% %folder_local%\client\CrossDomainAccessor\srcTaoSDK %folder_antSoftware%\andrea.libs.taoSDK\trunk\dev\src
