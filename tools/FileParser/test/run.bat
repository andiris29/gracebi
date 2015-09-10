call %ANT_SOFTWARE%\environment.bat

set folder_local=%folder_antSoftware%\andrea.graceBI\trunk\dev
set tool_file_parser="C:\Program Files (x86)\FileParser\FileParser.exe"

:: Splice
%tool_file_parser% %folder_local%\tools\FileParser\test\SuperMarket.xlsx
