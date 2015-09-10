(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.constants.VizType");
    var VizType = grace.constants.VizType;

    VizType.RECOMMEND = "RECOMMEND";
    /**
     * Highcharts
     */

    // 1 category, 0~1 series, 1 data
    VizType.BAR = "BAR";
    VizType.STACKED_BAR = "STACKED_BAR";
    VizType.COLUMN = "COLUMN";
    VizType.STACKED_COLUMN = "STACKED_COLUMN";
    VizType.LINE = "LINE";
    VizType.AREA = "AREA";
    VizType.RADAR = "RADAR";

    // 0 category, 1 series, 1 data
    VizType.PIE = "PIE";
    // 0 category, 1 series, 1 data with neg
    VizType.WATERFALL = "WATERFALL";

    // 0 category, 0~1 series, 2~3 data(Merged with bubble)
    VizType.SCATTER = "SCATTER";

    /**
     * Google Charts
     */
    // TODO
    VizType.TABLE = "TABLE";
    VizType.GEO = "GEO";
    VizType.TREE_MAP = "TREE_MAP";

    VizType._MANIFESTS = (function() {
        var gen = function(type, title, numDimensions, numMeasures, icon) {
            return {
                'type' : type,
                'title' : title,
                'required' : {
                    'numDimensions' : numDimensions,
                    'numMeasures' : numMeasures
                },
                'icon' : icon ? grace.Settings.dataDiscovery.folder + icon : ''
            }
        }
        var m = {};
        m[VizType.RECOMMEND] = gen(VizType.RECOMMEND, '推荐图形', 0, 0, '');

        m[VizType.COLUMN] = gen(VizType.COLUMN, '柱状图', 0, 1, './assets/navigator/column.png', '');
        m[VizType.BAR] = gen(VizType.BAR, '条状图', 0, 1, './assets/navigator/bar.png', '');
        m[VizType.RADAR] = gen(VizType.RADAR, '雷达图', 1, 1, './assets/navigator/radar.png', '');

        m[VizType.SCATTER] = gen(VizType.SCATTER, '散点图', 1, 1, './assets/navigator/scatter.png', '');

        m[VizType.LINE] = gen(VizType.LINE, '折线图', 1, 1, './assets/navigator/line.png', '');
        m[VizType.AREA] = gen(VizType.AREA, '面积图', 1, 1, './assets/navigator/area.png', '');

        m[VizType.PIE] = gen(VizType.PIE, '饼图', 1, 1, './assets/navigator/pie.png', '');
        m[VizType.STACKED_COLUMN] = gen(VizType.STACKED_COLUMN, '堆积柱状图', 2, 1, './assets/navigator/stackedColumn.png', '');
        m[VizType.STACKED_BAR] = gen(VizType.STACKED_BAR, '堆积条状图', 2, 1, './assets/navigator/stackedBar.png', '');

        return m;
    })();

    VizType.manifest = function(type) {
        return VizType._MANIFESTS[type];
    };

    VizType.vertical = function(type) {
        return type === VizType.BAR || type === VizType.STACKED_BAR;
    };
    VizType.horizontal = function(type) {
        return type === VizType.COLUMN || type === VizType.STACKED_COLUMN || type === VizType.LINE || type === VizType.AREA;
    };
})();
