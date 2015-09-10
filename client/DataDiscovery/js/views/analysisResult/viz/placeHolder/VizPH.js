(function($) {
	var grace = andrea.grace;
	var VizType = grace.constants.VizType;
	var VizBase = grace.views.analysisResult.viz.VizBase;

	andrea.blink.declare("andrea.grace.views.analysisResult.viz.placeHolder.VizPH");
	var VizPH = grace.views.analysisResult.viz.placeHolder.VizPH = function(dom, selectedVizType) {
		VizPH.superclass.constructor.apply(this, arguments);

		this._selectedVizType = selectedVizType;
	};
	andrea.blink.extend(VizPH, VizBase);

	VizPH.prototype.render = function(dataProvider, dimesionSAs, dataSAs) {
		VizBase._renderingCache = null;

		var $hint = $('<div/>').appendTo(this._$dom).addClass('grace-result-viz-placeHolder-hint');
		var $line1 = $('<span/>').appendTo($hint);
		$('<br/>').appendTo($hint);
		$('<br/>').appendTo($hint);
		var $line2 = $('<span/>').appendTo($hint);

		if (dataProvider && dataProvider.numRows === 0) {
			$line1.text('所有数据都被过滤掉了，');
			$line2.text('请修改过滤设置。');
		} else {
			if (this._selectedVizType === VizType.RECOMMEND) {
				$line1.text('从左边的纬度栏和指标栏');
				$line2.text('开启您数据发现之旅！');
			} else {
				var manifest = VizType.manifest(this._selectedVizType);
				var required = manifest.required;

				var text = '需要至少';
				if (required.numDimensions > 0) {
					text = text + required.numDimensions + '个分析纬度，';
				}
				if (required.numMeasures > 0) {
					text = text + required.numMeasures + '个分析指标。';
				}
				$line1.text(manifest.title + text);
				$line2.text('或者请使用推荐图形');
			}
		}
		$hint.css({
			'left' : (this._$dom.width() - $hint.width()) / 2 + 'px',
			'top' : (this._$dom.height() - $hint.height()) / 2 + 'px'
		});

		return true;
	};
})(jQuery);
