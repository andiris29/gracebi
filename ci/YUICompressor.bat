set folder_yuicompressor=C:/andiris29/Storages/¼á¹ûÔÆ/libs/js/yuicompressor-2.4.7
set folder_src=C:/andiris29/13.SourceForge/Andiris29/incubator/grace/DataDiscovery-splice
set folder_srcMinified=C:/andiris29/13.SourceForge/Andiris29/incubator/grace/DataDiscovery-min

java -jar %folder_yuicompressor%/build/yuicompressor-2.4.7.jar %folder_src%/css/grace.css -o %folder_srcMinified%/css/grace.min.css --charset utf-8

java -jar %folder_yuicompressor%/build/yuicompressor-2.4.7.jar %folder_src%/js/grace.js -o %folder_srcMinified%/js/grace.min.js --charset utf-8
java -jar %folder_yuicompressor%/build/yuicompressor-2.4.7.jar %folder_src%/libs/grace-highcharts.js -o %folder_srcMinified%/libs/grace-highcharts.min.js --charset utf-8