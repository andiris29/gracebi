set cloc_folder=C:/andiris29/Storages/¼á¹ûÔÆ/libs/common/CLOC
set base_folder=C:/andiris29/13.SourceForge/Andiris29/incubator/grace

%cloc_folder%/cloc-1.56 -xml -report-file=%base_folder%/ci/cloc_blink.xml %base_folder%/DataDiscovery/libs/blink
%cloc_folder%/cloc-1.56 -xml -report-file=%base_folder%/ci/cloc_DataDiscovery.xml %base_folder%/DataDiscovery/js
%cloc_folder%/cloc-1.56 -xml -report-file=%base_folder%/ci/cloc_iris.xml %base_folder%/DataProcessor/srcIris
%cloc_folder%/cloc-1.56 -xml -report-file=%base_folder%/ci/cloc_DataProcessor.xml %base_folder%/DataProcessor/src
