call %ANT_SOFTWARE%\environment.bat
node --debug %folder_antSoftware%\andrea.graceBI\trunk\dev\server\node\webServer\startup.js proxyHost=%proxy_host% proxyPort=%proxy_port%
pause