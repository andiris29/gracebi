(function($) {
    var grace = andrea.grace;

    andrea.blink.declare('andrea.grace.views.analysisResult.AnalysisResult');

    var VizFactory = grace.views.analysisResult.viz.VizFactory;
    var VizType = grace.constants.VizType;
    var DataProvider = grace.models.DataProvider;
    var FilterUtil = grace.utils.FilterUtil;
    var DataDiscoveryModel = grace.models.DataDiscoveryModel;
    var AnalysisResultEvent = grace.views.analysisResult.AnalysisResultEvent;
    var SerializeManager = grace.managers.SerializeManager;

    var AnalysisResult = grace.views.analysisResult.AnalysisResult = function(dom) {
        AnalysisResult.superclass.constructor.apply(this, arguments);

        this._$dom = $(dom);
        this._$dom.addClass('grace-result fancy-scrollbar');

        this._viz = null;
        this._vizContainer$ = null;

        this._$collab = null;

        this._createChildren();
    };
    andrea.blink.extend(AnalysisResult, andrea.blink.mvc.View);

    AnalysisResult.prototype._createChildren = function() {
        this._vizContainer$ = $('<div/>').appendTo(this._$dom);

        this._$collab = $('<div/>').addClass('grace-result-collab-container');

        this._$save = $('<button/>').addClass('grace-result-collab grace-result-collab-save');
        this._$save.attr('title', '保存当前状态');
        this._$save.on('click', $.proxy(function() {
            this.dispatchEvent(new AnalysisResultEvent(AnalysisResultEvent.SAVE, this, {
                'layout' : 'dataDiscovery',
            }));
        }, this));
        this._$save.appendTo(this._$collab);

        this._$share = $('<button/>').addClass('grace-result-collab grace-result-collab-share');
        this._$share.attr('title', '分享图表');
        this._$share.on('click', $.proxy(function() {
            alertify.reset();
            alertify.prompt('为图表输入标题：', $.proxy(function(ok, title) {
                if (ok) {
                    this.dispatchEvent(new AnalysisResultEvent(AnalysisResultEvent.SAVE, this, {
                        'layout' : 'vizOnly',
                        'title' : title
                    }));
                } else {
                    alertify.error('保存取消。');
                }
            }, this));
        }, this));
        this._$share.appendTo(this._$collab);

        if (grace.Config.dataDiscovery.layout === 'vizOnly') {
            this._$collab.hide();
        }
    };
    /**
     *
     * @param {Array.<Array.<*>>} dataProvider
     * @param {Array.<ShelvedAnalysis>} dimesionSAs
     * @param {Array.<ShelvedAnalysis>} dataSAs
     */
    AnalysisResult.prototype.render = function(selectedVizType, dataProvider, filterSAs, dimesionSAs, dataSAs) {
        // Prepare data
        var clear = function(sa) {
            sa.visualized = false;
            sa.numPartialVisualized = 0;
        };
        _.each(dimesionSAs, clear);
        _.each(dataSAs, clear);

        // Filter
        dataProvider = FilterUtil.filter(dataProvider, filterSAs);
        // Find viz type
        var vizType = null;
        if (dataProvider && dataProvider.numRows === 0) {
            vizType = null;
        } else {
            if (selectedVizType === VizType.RECOMMEND) {
                vizType = this._recommend(dataProvider, dimesionSAs, dataSAs);
            } else {
                if (this._valid(selectedVizType, dataProvider, dimesionSAs, dataSAs)) {
                    vizType = selectedVizType;
                } else {
                    vizType = null;
                }
            }
        }
        // Prepare DOM
        var $viz = $('<div/>').css({
            'height' : this.size().height + 'px'
        }).appendTo(this._vizContainer$);
        // Render viz
        var viz/*VizBase*/ = VizFactory.produce($viz[0], vizType, selectedVizType);
        var success = viz.render(dataProvider, dimesionSAs, dataSAs);

        if (success) {
            // Rmove old one
            this._$collab.detach();
            if (this._viz) {
                this._viz.destroy();
            }
            // Init new one
            this._viz = viz;
            var vizJSON = this._viz.toJSON();
            SerializeManager.instance().saveViz(vizJSON);
            if (vizJSON && SerializeManager.instance().serializable()) {
                this._$collab.appendTo(this._$dom);
            }
            // Add scroll bar
            var domSize = this.size();
            var vizSize = viz.size();
            this._vizContainer$.css({
                'overflow-x' : 'hidden',
                'overflow-y' : 'hidden'
            });
            if (vizSize.width > domSize.width) {
                this._vizContainer$.css('overflow-x', 'auto');
            }
            if (vizSize.height > domSize.height) {
                this._vizContainer$.css('overflow-y', 'auto');
            }
        } else {
            $viz.detach();
        }
    };
    AnalysisResult.prototype._validateSize = function() {
        var size = this.size();

        this._$dom.css({
            'height' : size.height + 'px',
            'width' : size.width + 'px'
        });

        if (this._viz) {
            this._viz.size(size);
        }
    };
    AnalysisResult.prototype._recommend = function(dataProvider, dimesionSAs, dataSAs) {
        if (dataSAs.length === 0) {
            return null;
        }
        // Dimension
        var d0, d1;
        // Number unique values
        var l0, l1;
        if (dimesionSAs.length >= 2 && dataSAs.length >= 2) {
            // Dim 2+, Mea 2+
            return VizType.SCATTER;
        } else if (dimesionSAs.length >= 2 && dataSAs.length === 1) {
            // Dim 2+, Mea 1
            d0 = dimesionSAs[0];
            l0 = dataProvider.getCValues(d0.source.index, true, false).length;
            d1 = dimesionSAs[1];
            l1 = dataProvider.getCValues(d1.source.index, true, false).length;
            if (d0.isDateSeries()) {
                return VizType.LINE;
            } else if (l0 < 16 && l1 < 16) {
                return VizType.COLUMN;
            } else if ((l0 * l1) > (40 * 40)) {
                return VizType.SCATTER;
            } else if (l0 > l1) {
                return VizType.STACKED_COLUMN;
            } else {
                return VizType.STACKED_BAR;
            }
        } else if (dimesionSAs.length === 1) {
            // Dim 1
            d0 = dimesionSAs[0];
            l0 = dataProvider.getCValues(d0.source.index, true, false).length;
            if (d0.isDateSeries()) {
                return VizType.LINE;
            } else {
                return VizType.COLUMN;
            }
        } else if (dimesionSAs.length === 0) {
            // Dim 0
            return VizType.BAR;
        }

        return null;
    };

    AnalysisResult.prototype._valid = function(vizType, dataProvider, dimesionSAs, dataSAs) {
        var manifest = VizType.manifest(vizType);
        var required = manifest.required;

        return dimesionSAs.length >= required.numDimensions && dataSAs.length >= required.numMeasures;
    };
})(jQuery);
