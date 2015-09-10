(function($) {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.views.analysisResult.viz.highCharts.Pie");

    var HighChartsOption = andrea.grace.views.analysisResult.viz.highCharts.supportClasses.HighChartsOption;
    var CalculatorFactory = grace.calculator.supportClasses.CalculatorFactory;

    var Pie = grace.views.analysisResult.viz.highCharts.Pie = function(dom) {
        Pie.superclass.constructor.apply(this, arguments);

        var _this = this;
    };
    andrea.blink.extend(Pie, grace.views.analysisResult.viz.VizBase);

    Pie.prototype.render = function(dataProvider, dimesions, datas) {
        Pie.superclass.render.apply(this, arguments);

        var highConfig = HighChartsOption.genMain('pie');

        var dataConfig = HighChartsOption.dataConfig(dataProvider, null, dimesions[0], datas.slice(0, 1));
        highConfig.xAxis = {
            "title" : {
                "text" : dimesions[0].source.name
            },
            "categories" : dataConfig.categories
        }
        // Edit the common data config
        for (var i = 0; i < dataConfig.series.length; i++) {
            var categories = dataConfig.series[i].data;
            for (var j = 0; j < categories.length; j++) {
                categories[j].y = categories[j].data[0];
            }
        }
        highConfig.series = dataConfig.series;

        highConfig.tooltip = {
            hideDelay : 240
        };        highConfig.plotOptions = {
            "series" : {
                "dataLabels" : {
                    "enabled" : true,
                    "formatter" : function() {
                        return '<b>' + this.point.name + '</b>: ' + this.percentage.toFixed(2) + ' %';
                    }
                }
            }
        };

        if (highConfig.series.length > 50) {
            this._addMessage('W001');

            var _this = this;
            _.delay(function() {
                $(_this._dom).highcharts(highConfig);
                this._removeMessages();
            }, 300);
        } else {
            $(this._dom).highcharts(highConfig);
        }
    }
})(jQuery);
