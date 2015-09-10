(function($) {
    var grace = andrea.grace;

    var VizType = grace.constants.VizType;

    andrea.blink.declare("andrea.grace.views.analysisResult.viz.VizFactory");
    var VizFactory = grace.views.analysisResult.viz.VizFactory;

    VizFactory.produce = function(dom, type, selectedVizType) {
        var vizInstance;
        var placeHolder = grace.views.analysisResult.viz.placeHolder;
        var highCharts = grace.views.analysisResult.viz.highCharts;
        var googleCharts = grace.views.analysisResult.viz.googleCharts;

        if (type === VizType.BUBBLE) {
            return new highCharts.Scatter(dom, 'bubble', type);
        } else if (type === VizType.SCATTER) {
            return new highCharts.Scatter(dom, 'scatter', type);
        } else if (type === VizType.BAR || type === VizType.STACKED_BAR) {
            return new highCharts.BasicXY(dom, 'bar', type);
        } else if (type === VizType.COLUMN || type === VizType.STACKED_COLUMN) {
            return new highCharts.BasicXY(dom, 'column', type);
        } else if (type === VizType.LINE || type === VizType.RADAR) {
            return new highCharts.BasicXY(dom, 'line', type);
        } else if (type === VizType.AREA) {
            return new highCharts.BasicXY(dom, 'area', type);
        } else if (type === VizType.PIE) {
            return new highCharts.Pie(dom, 'pie', type);
        } else {
            return new placeHolder.VizPH(dom, selectedVizType);
        }
    };
})(jQuery);
