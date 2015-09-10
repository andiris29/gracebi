call %ANT_SOFTWARE%\environment.bat
%folder_mongodb%\bin\mongo --port 30002

:: use grace
:: db.dropDatabase();
:: db.addUser('andrea', 'andrea@mongo');