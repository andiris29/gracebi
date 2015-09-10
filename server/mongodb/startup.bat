call %ANT_SOFTWARE%\environment.bat
%folder_mongodb%\bin\mongod --dbpath=%folder_mongodb%\db --port 30002 --auth

:: http://localhost:28017/