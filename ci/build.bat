@echo off
call %ANT_SOFTWARE%\environment.bat

set folder_local=%folder_antSoftware%\andrea.graceBI\trunk\dev
set folder_client=%folder_local%\client
set folder_client_min=%folder_local%\client-min

:: Splice
%tool_splice% %folder_client%\index.html %folder_client%\DataDiscovery-splice true

:: Compress
java -jar %tool_yuicompressor% %folder_client%\DataDiscovery-splice\css\grace.css -o %folder_client_min%\DataDiscovery\css\grace.min.css --charset utf-8
java -jar %tool_yuicompressor% %folder_client%\DataDiscovery-splice\css-touch\grace-touch.css -o %folder_client_min%\DataDiscovery\css-touch\grace-touch.min.css --charset utf-8
java -jar %tool_yuicompressor% %folder_client%\DataDiscovery-splice\js\grace.js -o %folder_client_min%\DataDiscovery\js\grace.min.js --charset utf-8
java -jar %tool_yuicompressor% %folder_client%\DataDiscovery-splice\libs\blink.js -o %folder_client_min%\DataDiscovery\libs\blink.min.js --charset utf-8
java -jar %tool_yuicompressor% %folder_client%\DataDiscovery-splice\libs\tp.js -o %folder_client_min%\DataDiscovery\libs\tp.min.js --charset utf-8
java -jar %tool_yuicompressor% %folder_client%\DataDiscovery-splice\libs\tpLazy.js -o %folder_client_min%\DataDiscovery\libs\tpLazy.min.js --charset utf-8

:: Compare full vs min
%tool_BCompare% %folder_client% %folder_client_min%
