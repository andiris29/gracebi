(function() {
    var grace = andrea.grace;
    andrea.blink.declare("andrea.grace.DataDiscovery");

    var App = andrea.blink.mvc.App;
    var AppConst = grace.constants.AppConst;

    var DataDiscovery = grace.DataDiscovery = function(div) {
        DataDiscovery.superclass.constructor.apply(this, arguments);

        this._div = div;
        this._$dom = $(div);

        this._viewSourceDim = null;
        this._viewSourceMea = null;

        this._viewDesDimensionShelf = null;
        this._viewDesMeasureShelf = null;
        this._viewFilterShelf = null;

        this._viewAnalysisResult = null;

        this._viewVizNavigator = null;

        this._applyHighSettings();
        this._startup();
    };
    andrea.blink.extend(DataDiscovery, andrea.blink.mvc.View);

    DataDiscovery.prototype._applyHighSettings = function() {
        Highcharts.setOptions({
            xAxis : {
                title : {
                    style : {
                        fontFamily : 'Trebuchet MS, Verdana, sans-serif, FontAwesome'
                    }
                }
            },
            yAxis : {
                title : {
                    style : {
                        fontFamily : 'Trebuchet MS, Verdana, sans-serif, FontAwesome'
                    }
                }
            },
        });
    }
    /**
     *
     * @param {Object} rows [
     * 	[cell1, cell2, ...],
     * 	...
     * ]
     *
     * @param {Object} columnDescriptors [{
     * 		"name": columnName1, // Optional
     * 		"converterType": columnConverterType1, // Optional
     * 		"analysisType": columnAnalysisType1 // Optional
     * 	},
     * 	...
     * ]
     *
     */
    DataDiscovery.prototype.rowBasedDataProvider = function(rows, columnDescriptors, source) {
        this._apiMediator.rowBasedDataProvider(rows, columnDescriptors, source);
    };

    DataDiscovery.prototype._startup = function() {
        var app = new App();

        var view = null;
        var mediator = null;

        this._viewSourceDim = new grace.views.analysisContainer.source.SrcDimensionShelf($("#divSrcDim")[0]);
        this._viewSourceMea = new grace.views.analysisContainer.source.SrcMeasureShelf($("#divSrcMea")[0]);

        this._viewDesDimensionShelf = new grace.views.analysisContainer.destination.DesDimensionShelf($("#divDesAnalysisDim")[0]);
        this._viewDesMeasureShelf = new grace.views.analysisContainer.destination.DesMeasureShelf($("#divDesAnalysisMea")[0]);
        this._viewFilterShelf = new grace.views.analysisContainer.processor.FilterShelf($("#divProcFilter")[0]);

        this._viewAnalysisResult = new grace.views.analysisResult.AnalysisResult($("#divAnalysisResult")[0]);

        this._viewVizNavigator = new grace.views.vizNavigator.VizNavigator($("#divVizNavigator")[0]);
        // Models
        app.registerModel(AppConst.MODEL_GRACE, new grace.models.DataDiscoveryModel());

        // Actions
        app.registerAction(AppConst.ACTION_CHANGE_DATA_PROVIDER, grace.actions.ChangeDataProviderAction);
        app.registerAction(AppConst.ACTION_RUN_ANALYSIS, grace.actions.RunAnalysisAction);

        // Views
        // var appView = this._appView = new grace.views.analysisContainer.AppView(this._div);

        // Mediators
        mediator = new grace.DataDiscoveryMediator();
        app.registerViewMediator(AppConst.MEDIATOR_DATA_DISCOVERY, mediator);
        this._apiMediator = mediator;

        mediator = new grace.views.analysisContainer.source.SrcDimensionShelfMediator(this._viewSourceDim);
        app.registerViewMediator(AppConst.MEDIATOR_ANALYSIS_SRC_DIM, mediator);
        mediator = new grace.views.analysisContainer.source.SrcMeasureShelfMediator(this._viewSourceMea);
        app.registerViewMediator(AppConst.MEDIATOR_ANALYSIS_SRC_MEA, mediator);

        mediator = new grace.views.analysisContainer.destination.DesDimensionShelfMediator(this._viewDesDimensionShelf);
        app.registerViewMediator(AppConst.MEDIATOR_ANALYSIS_DES_DIM, mediator);
        mediator = new grace.views.analysisContainer.destination.DesMeasureShelfMediator(this._viewDesMeasureShelf);
        app.registerViewMediator(AppConst.MEDIATOR_ANALYSIS_DES_MEA, mediator);
        mediator = new grace.views.analysisContainer.processor.FilterShelfMediator(this._viewFilterShelf);
        app.registerViewMediator(AppConst.MEDIATOR_ANALYSIS_DES_MEA, mediator);

        mediator = new grace.views.analysisResult.AnalysisResultMediator(this._viewAnalysisResult);
        app.registerViewMediator(AppConst.MEDIATOR_ANALYSIS_RESULT, mediator);

        mediator = new grace.views.vizNavigator.VizNavigatorMediator(this._viewVizNavigator);
        app.registerViewMediator(AppConst.MEDIATOR_VIZ_NAVIGATOR, mediator);

        var _this = this;
        var invalidateSize = false;
        $(window).resize(function() {
            if (!invalidateSize) {
                setTimeout(function() {
                    invalidateSize = false;
                    _this._validateSize();
                }, 1000 / 24);
            }
            invalidateSize = true;
        });
        this._validateSize();
    };

    DataDiscovery.prototype._validateSize = function() {
        var $div;
        var w, h;
        var vGap = parseInt($(this._viewSourceDim.dom()).css("margin-bottom"));
        var hGap = 0;
        // Main
        var marginBody = parseInt($("body").css("margin"));
        var windowHeight = $(window).height() - marginBody * 2;
        var windowWidth = $(window).width() - marginBody * 2;

        var $header = $('#divHeader', this._$dom);
        var $main = $('#divMain', this._$dom);
        var marginMain = parseInt($main.css("margin"));
        var mainHeight = windowHeight - $header.outerHeight() - marginMain * 2;
        var mainWidth = windowWidth - marginMain * 2;
        $main.css({
            "height" : mainHeight + "px",
            "width" : mainWidth + "px"
        });

        // $div = $("#divMain");

        // Col1: source dim, source mea
        $("#divCol1").css({
            "width" : 180 + "px",
            "height" : mainHeight + "px"
        });
        this._viewSourceDim.size({
            "width" : 180,
            "height" : (mainHeight - vGap) / 2 + vGap
        });
        this._viewSourceMea.size({
            "width" : 180,
            "height" : (mainHeight - vGap) / 2 + vGap
        });

        // Col2: proc filter, des marker
        // TODO Enabled Col2 in later release
        $("#divCol2").css({
            "width" : 0 + "px",
            "height" : 0 + "px",
            "visibility" : "hidden"
        });
        // $("#divCol2").css({
        // "width" : 180 + "px",
        // "height" : mainHeight + "px"
        // });
        // this._viewSecondaryDesDimensionShelf.size({
        // "width" : 180,
        // "height" : 35 + 34 * 1
        // });

        // Col3: proc filter, des marker
        w = mainWidth - 180 * 1 - hGap * 2;
        $("#divCol3").css({
            "width" : w + "px",
            "height" : mainHeight + "px"
        });

        var $divNavigator = $('#divVizNavigator', this._$dom);

        var $divDestinations = $('#divDestinations', this._$dom);
        $divDestinations.css({
            'width' : Math.min(1024, w - $divNavigator.width() - parseInt($divDestinations.css('margin-right'))) + 'px'
        });

        this._viewDesDimensionShelf.size({
            "height" : 35 + 34 * 1
        });
        this._viewDesMeasureShelf.size({
            "height" : 35 + 34 * 1
        });
        this._viewAnalysisResult.size({
            "height" : mainHeight - (35 + 34 * 1) * 2
        })
    };
    DataDiscovery.prototype._createChildDiv = function(parent) {
        var div = document.createElement('div');
        if (parent) {
            $(div).appendTo(parent);
        }

        return div;
    };
})();
