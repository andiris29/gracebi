:: Prepare
set folder_local=C:\andiris29\15.CloudForge\antSoftware\andrea.graceBI\trunk\dev\
set folder_ci=%folder_local%\ci\
set folder_client=%folder_local%\client\
set folder_client_min=%folder_local%\client-min\
set folder_server=%folder_local%\server\

set folder_remote=\\121.199.31.4\Files\graceBI\
set folder_remote_client_min=%folder_remote%\client-min
set folder_remote_server=%folder_remote%\server

set exe_splice="C:\Program Files (x86)\splice\splice.exe"
set exe_BCompare="C:\Program Files (x86)\Beyond Compare 3\BCompare.exe"
set jar_yuicompressor=C:\andiris29\Storages\坚果云\libs\js\yuicompressor-2.4.7\build\yuicompressor-2.4.7.jar
set exe_cloc="C:\andiris29\Storages\坚果云\libs\common\CLOC\cloc-1.56.exe"

set skip_sync_remote=true
set skip_cloc=true
%folder_ci%\_run.bat