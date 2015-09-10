(function($) {
    var grace = andrea.grace;
    var VizType = grace.constants.VizType;

    andrea.blink.declare("andrea.grace.views.analysisResult.viz.placeHolder.VizPH");
    var VizPH = grace.views.analysisResult.viz.placeHolder.VizPH = function(dom, selectedVizType) {
        VizPH.superclass.constructor.apply(this, arguments);

        this._selectedVizType = selectedVizType;
    };
    andrea.blink.extend(VizPH, grace.views.analysisResult.viz.VizBase);

    VizPH.prototype.render = function(dataProvider, dimesions, datas) {
        VizPH.superclass.render.apply(this, arguments);

        var $hint = $('<div/>').appendTo(this._$dom).addClass('grace-result-viz-placeHolder-hint');
        var $line1 = $('<span/>').appendTo($hint);
        $('<br/>').appendTo($hint);
        $('<br/>').appendTo($hint);
        var $line2 = $('<span/>').appendTo($hint);

        if (this._selectedVizType === VizType.RECOMMEND) {
            $line2.text('从左边的纬度卡片和指标卡片开始数据发现之旅吧！');
        } else {
            $line1.text('未完成的图形');
            var manifest = VizType.manifest(this._selectedVizType);
            var required = manifest.required;
            var text = manifest.title + ' 需要至少';
            if (required.numDimensions > 0) {
                text = text + required.numDimensions + '个分析纬度，';
            }
            if (required.numMeasures > 0) {
                text = text + required.numMeasures + '个分析指标。';
            }
            $line2.text(text);
        }
        $hint.css({
            'left' : (this._$dom.width() - $hint.width()) / 2 + 'px',
            'top' : (this._$dom.height() - $hint.height()) / 2 + 'px'
        });
    };
})(jQuery);
