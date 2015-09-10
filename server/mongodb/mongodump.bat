call %ANT_SOFTWARE%\environment.bat
rmdir /q /s %folder_antSoftware%\andrea.graceBI\trunk\dev\server\mongodb\dump\grace
%folder_mongodb%\bin\mongodump.exe -db grace --port 30002 --out %folder_antSoftware%\andrea.graceBI\trunk\dev\server\mongodb\dump