(function() {
	var grace = andrea.grace;

	andrea.blink.declare("andrea.grace.views.analysisContainer.processor.FilterShelf");

	var AnalysisType = grace.constants.AnalysisType;
	var ShelfType = grace.constants.ShelfType;

	var FilterShelf = grace.views.analysisContainer.processor.FilterShelf = function(dom) {
		FilterShelf.superclass.constructor.apply(this, arguments);

		this._setTitle("过滤数据");
	};
	andrea.blink.extend(FilterShelf, grace.views.analysisContainer.supportClasses.ShelfBase);

	FilterShelf.prototype._initialization = function() {
		this._type = ShelfType.PROC_FILTER;
		this._layout = "vertical";
	};
})();
