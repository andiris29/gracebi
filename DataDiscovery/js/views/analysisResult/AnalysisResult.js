(function($) {
    var grace = andrea.grace;

    andrea.blink.declare('andrea.grace.views.analysisResult.AnalysisResult');

    var VizFactory = grace.views.analysisResult.viz.VizFactory;
    var VizType = grace.constants.VizType;
    var DataType = grace.constants.DataType;

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
     * @param {Array.<ShelvedAnalysis>} dimesions
     * @param {Array.<ShelvedAnalysis>} datas
     */
    AnalysisResult.prototype.render = function(selectedVizType, dataProvider, dimesions, datas) {
        this._renderArgs = arguments;

        // Prepare data
        var clear = function(sa) {
            sa.visualized = false;
            sa.numPartialVisualized = 0;
        }
        _.each(dimesions, clear);
        _.each(datas, clear);

        // TODO Filter dataProvider and create a newer to render

        // Find viz type
        var vizType = null;
        if (selectedVizType === VizType.RECOMMEND) {
            vizType = this._recommend(dataProvider, dimesions, datas);
        } else {
            if (this._valid(selectedVizType, dataProvider, dimesions, datas)) {
                vizType = selectedVizType;
            } else {
                vizType = null;
            }
        }
        // Prepare DOM
        this._$dom.empty();
        var $viz = $('<div/>').appendTo(this._$dom).css({
            'height' : this.size().height + 'px'
        });
        // Render viz
        var viz/*VizBase*/ = VizFactory.produce($viz[0], vizType, selectedVizType);
        viz.render(dataProvider, dimesions, datas);
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

        if (dimesionSAs.length === 0) {
            return VizType.BAR;
        } else {
            var d0 = dimesionSAs[0];
            var d1 = dimesionSAs[1];

            if (d0.isDateSeries()) {
                return VizType.LINE;
            } else {
                if (dataSAs.length === 1 || d0.source.numUniqueValue < 60) {
                    return VizType.COLUMN;
                } else if (dataSAs.length === 2) {
                    return VizType.SCATTER;
                } else if (dataSAs.length >= 3) {
                    return VizType.BUBBLE;
                }
            }
        }
        return null;
    };

    AnalysisResult.prototype._valid = function(vizType, dataProvider, dimesionSAs, dataSAs) {
        var manifest = VizType.manifest(vizType);
        var required = manifest.required;

        return dimesionSAs.length >= required.numDimensions && dataSAs.length >= required.numMeasures;
    };})(jQuery);
