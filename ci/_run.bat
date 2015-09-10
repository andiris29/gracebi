:: Splice
%exe_splice% %folder_client%\index.html %folder_client%\DataDiscovery-splice true

:: Compress
java -jar %jar_yuicompressor% %folder_client%\DataDiscovery-splice\css\grace.css -o %folder_client_min%\DataDiscovery\css\grace.min.css --charset utf-8
java -jar %jar_yuicompressor% %folder_client%\DataDiscovery-splice\js\grace.js -o %folder_client_min%\DataDiscovery\js\grace.min.js --charset utf-8
java -jar %jar_yuicompressor% %folder_client%\DataDiscovery-splice\libs\blink.js -o %folder_client_min%\DataDiscovery\libs\blink.min.js --charset utf-8
java -jar %jar_yuicompressor% %folder_client%\DataDiscovery-splice\libs\tp.js -o %folder_client_min%\DataDiscovery\libs\tp.min.js --charset utf-8
java -jar %jar_yuicompressor% %folder_client%\DataDiscovery-splice\libs\tpLazy.js -o %folder_client_min%\DataDiscovery\libs\tpLazy.min.js --charset utf-8

java -jar %jar_yuicompressor% %folder_client%\DataDiscovery\data\WorldBank.js -o %folder_client_min%\DataDiscovery\data\WorldBank.js --charset utf-8
java -jar %jar_yuicompressor% %folder_client%\DataDiscovery\data\SuperMarket.js -o %folder_client_min%\DataDiscovery\data\SuperMarket.js --charset utf-8

:: Compare full vs min
%exe_BCompare% %folder_client% %folder_client_min%

:: Compare remote
if "%skip_sync_remote%" == "true" goto skip
%exe_BCompare% %folder_local% %folder_remote%

:: CLOC
:skip
if "%skip_cloc%" == "true" goto skip
%exe_cloc% -xml -report-file=%folder_ci%\cloc_result\js_blink.xml %folder_client%\DataDiscovery\libs\blink
%exe_cloc% -xml -report-file=%folder_ci%\cloc_result\js_DataDiscovery.xml %folder_client%\DataDiscovery\js
%exe_cloc% -xml -report-file=%folder_ci%\cloc_result\as_iris.xml %folder_client%\FileAccessor\srcIris
%exe_cloc% -xml -report-file=%folder_ci%\cloc_result\as_FileAccessor.xml %folder_client%\FileAccessor\src
%exe_cloc% -xml -report-file=%folder_ci%\cloc_result\as_CrossDomainAccessor.xml %folder_client%\CrossDomainAccessor\src

:skip