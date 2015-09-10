(function() {
    var grace = andrea.grace;
    andrea.blink.declare("andrea.grace.DataDiscovery");

    var App = andrea.blink.mvc.App;
    var Loading = grace.views.popUp.Loading;
    var AppConst = grace.constants.AppConst;

    var DataDiscovery = grace.DataDiscovery = function(div) {
        DataDiscovery.superclass.constructor.apply(this, arguments);

        this._div = div;
        this._$dom = $(div);

        this._loading = null;

        this._viewSourceDim = null;
        this._viewSourceMea = null;

        this._viewDesDimensionShelf = null;
        this._viewDesMeasureShelf = null;
        this._viewFilterShelf = null;

        this._viewAnalysisResult = null;

        this._viewVizNavigator = null;

        this._applyHighSettings();
        this._startup();

        $('#divHeader', this._dom).click(function() {
            window.location.href = grace.Settings.home;
        });
        // Guide
        this._guide$ = $('#divGuide', this._dom);
        this._$dom.droppable({
            'accept' : function() {
                return true;
            },
            'activate' : $.proxy(function(event) {
                if (this._guide$) {
                    this._guide$.fadeOut(100);
                }
            }, this),
            'deactivate' : $.proxy(function(event) {
                _.defer($.proxy(function() {
                    if (this._guide$) {
                        this._guide$.fadeIn(100);
                    }
                }, this));
            }, this)
        });
    };
    andrea.blink.extend(DataDiscovery, andrea.blink.mvc.View);

    DataDiscovery.prototype.vizContextChanged = function(numAnalysisDatas) {
        if (this._guide$ && numAnalysisDatas > 0) {
            var guide$ = this._guide$;
            this._guide$.fadeOut(400, function() {
                guide$.empty().detach();
            });
            this._guide$ = null;
        }
    };
    DataDiscovery.prototype._applyHighSettings = function() {
        Highcharts.setOptions({
            'chart' : {
                'style' : {
                    'fontFamily' : 'Trebuchet MS, Verdana, sans-serif, FontAwesome'
                }
            }
        });
    };

    DataDiscovery.prototype.addLoading = function() {
        if (!this._loading) {
            this._loading = new Loading($('<div/>'));
            this._loading.open(this._$dom, true);
        }
    };
    DataDiscovery.prototype.removeLoading = function() {
        if (this._loading) {
            this._loading.close();
            this._loading = null;
        }
    };
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
    DataDiscovery.prototype.loadCollaboration = function() {
        this._apiMediator.loadCollaboration();
    };

    DataDiscovery.prototype._startup = function() {
        // TODO Refactor app to Grace.js, not the DataDiscovery
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
        app.registerAction(AppConst.ACTION_SAVE_COLLABORATION, grace.actions.SaveCollaborationAction);
        app.registerAction(AppConst.ACTION_LOAD_COLLABORATION, grace.actions.LoadCollaborationAction);

        // Views
        // var appView = this._appView = new grace.views.analysisContainer.AppView(this._div);

        // Mediators
        mediator = new grace.DataDiscoveryMediator(this);
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
        // Main
        var marginBody = parseInt($("body").css("margin"));
        var windowHeight = $(window).height() - marginBody * 2;
        var windowWidth = $(window).width() - marginBody * 2;

        var $header = $('#divHeader', this._$dom);
        var $footer = $('#divFooter', this._$dom);
        var $main = $('#divMain', this._$dom);
        // vMargin = parseInt($main.css("margin-top")) + parseInt($main.css("margin-bottom"));
        var mainHeight = windowHeight - $header.outerHeight() - $footer.outerHeight() - $main.vMargin();
        var mainWidth = windowWidth - $main.hMargin();
        $main.css({
            "height" : mainHeight + "px",
            "width" : mainWidth + "px"
        });

        if (grace.Config.dataDiscovery.layout === 'vizOnly') {
            $("#divCol1").hide();
            $("#divCol2").hide();
            $("#divCol3").css({
                "width" : mainWidth + "px",
                "height" : mainHeight + "px"
            });
            $("#divAnalysis").hide();
            this._viewAnalysisResult.size({
                "width" : mainWidth,
                "height" : mainHeight
            });
            $("#divGuide").hide();
            
        } else {
            // Col1: source dim, source mea
            var column1Width = 172;
            $("#divCol1").css({
                "width" : column1Width + "px",
                "height" : mainHeight + "px"
            });

            $div = $(this._viewSourceDim.dom());
            var vGap = parseInt($(this._viewSourceDim.dom()).css("margin-bottom"));
            this._viewSourceDim.size({
                "width" : column1Width,
                "height" : (mainHeight - vGap) / 2 + vGap - $div.vPadding() - 6
            });
            this._viewSourceMea.size({
                "width" : column1Width,
                "height" : (mainHeight - vGap) / 2 + vGap - $div.vPadding() - 6
            });

            // Col2: proc filter, des marker
            var column2Width = 142;
            $("#divCol2").css({
                "width" : column2Width + "px",
                // "height" : 300 + "px"
            });
            this._viewFilterShelf.size({
                "height" : 228
            });

            // Col3: proc filter, des marker
            w = mainWidth - $("#divCol1").layoutWidth() - $("#divCol2").layoutWidth();
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
                "height" : 35 + 34 * 1 - 6
            });
            this._viewDesMeasureShelf.size({
                "height" : 35 + 34 * 1 - 6
            });
            this._viewAnalysisResult.size({
                "height" : mainHeight - (35 + 34 * 1) * 2
            });
        }
    };
    DataDiscovery.prototype._createChildDiv = function(parent) {
        var div = document.createElement('div');
        if (parent) {
            $(div).appendTo(parent);
        }

        return div;
    };
})();
