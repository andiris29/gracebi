(function($) {
    var grace = andrea.grace;

    andrea.blink.declare('andrea.grace.views.analysisResult.AnalysisResult');

    var VizFactory = grace.views.analysisResult.viz.VizFactory;
    var VizType = grace.constants.VizType;
    var DataProvider = grace.models.DataProvider;
    var FilterUtil = grace.utils.FilterUtil;

    var AnalysisResult = grace.views.analysisResult.AnalysisResult = function(dom) {
        AnalysisResult.superclass.constructor.apply(this, arguments);

        this._$dom = $(dom);
        this._$dom.addClass('grace-result fancy-scrollbar');

        this._renderArgs = null;
    };
    andrea.blink.extend(AnalysisResult, andrea.blink.mvc.View);

    /**
     *
     * @param {Array.<Array.<*>>} dataProvider
     * @param {Array.<ShelvedAnalysis>} dimesionSAs
     * @param {Array.<ShelvedAnalysis>} dataSAs
     */
    AnalysisResult.prototype.render = function(selectedVizType, dataProvider, filterSAs, dimesionSAs, dataSAs) {
        this._renderArgs = arguments;

        // Prepare data
        var clear = function(sa) {
            sa.visualized = false;
            sa.numPartialVisualized = 0;
        }
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
        });
        // this._$dom.empty().append($viz);
        this._$dom.append($viz);
        // Render viz
        var viz/*VizBase*/ = VizFactory.produce($viz[0], vizType, selectedVizType);
        var success = viz.render(dataProvider, dimesionSAs, dataSAs);
        if (success) {
            while (this._$dom.children().length > 1) {
                this._$dom.children().eq(0).detach();
            }
            // Add scroll bar
            var domSize = this.size();
            var vizSize = viz.size();
            this._$dom.css({
                'overflow-x' : 'hidden',
                'overflow-y' : 'hidden'
            })
            if (vizSize.width > domSize.width) {
                this._$dom.css('overflow-x', 'auto');
            }
            if (vizSize.height > domSize.height) {
                this._$dom.css('overflow-y', 'auto');
            }
        } else {
            while (this._$dom.children().length > 1) {
                this._$dom.children().eq(this._$dom.children().length - 1).detach();
            }
        }
    }
    AnalysisResult.prototype._validateSize = function() {
        var size = this.size();

        this._$dom.css({
            'height' : size.height + 'px',
            'width' : size.width + 'px'
        });

        if (this._renderArgs) {
            this.render.apply(this, this._renderArgs);
        }
    };
    AnalysisResult.prototype._recommend = function(dataProvider, dimesionSAs, dataSAs) {        if (dataSAs.length === 0) {
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
    };})(jQuery);
