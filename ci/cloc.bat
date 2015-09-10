@echo off
call %ANT_SOFTWARE%\environment.bat

set folder_local=%folder_antSoftware%\andrea.graceBI\trunk\dev
set folder_client=%folder_local%\client
set folder_ci=%folder_local%\client\ci

%tool_cloc% -xml -report-file=%folder_ci%\cloc_result\js_blink.xml %folder_client%\DataDiscovery\libs\blink
%tool_cloc% -xml -report-file=%folder_ci%\cloc_result\js_DataDiscovery.xml %folder_client%\DataDiscovery\js
%tool_cloc% -xml -report-file=%folder_ci%\cloc_result\as_iris.xml %folder_client%\FileAccessor\srcIris
%tool_cloc% -xml -report-file=%folder_ci%\cloc_result\as_FileAccessor.xml %folder_client%\FileAccessor\src
%tool_cloc% -xml -report-file=%folder_ci%\cloc_result\as_CrossDomainAccessor.xml %folder_client%\CrossDomainAccessor\src
