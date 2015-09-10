call %ANT_SOFTWARE%\environment.bat

set version=1.0.0
set folder_src=%folder_antSoftware%\com.focosee.server\trunk\dev\node\andrea-%version%
set folder_des=%folder_antSoftware%\andrea.libs.node\branches\%version%

%tool_BCompare% %folder_src% %folder_des%
