call %ANT_SOFTWARE%\environment.bat

set folder_local=%folder_antSoftware%\andrea.graceBI\branches\com.metadata
set folder_local_trunk_dev=%folder_antSoftware%\andrea.graceBI\trunk\dev

%tool_BCompare% %folder_local_trunk_dev% %folder_local%
