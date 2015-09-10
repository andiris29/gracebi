(function($) {

	var grace = andrea.grace;

	andrea.blink.declare("andrea.grace.views.analysisContainer.source.SrcMeasureShelfMediator");

	var AppConst = grace.constants.AppConst;
	var AnalysisType = andrea.grace.constants.AnalysisType;
	/**
	 * App Mediator.
	 */
	var SrcMeasureShelfMediator = grace.views.analysisContainer.source.SrcMeasureShelfMediator = function() {
		SrcMeasureShelfMediator.superclass.constructor.apply(this, arguments);
	};

	andrea.blink.extend(SrcMeasureShelfMediator, grace.views.analysisContainer.supportClasses.ShelfBaseMediator);

	SrcMeasureShelfMediator.prototype.init = function() {
		SrcMeasureShelfMediator.superclass.init.apply(this, arguments);
	};

	SrcMeasureShelfMediator.prototype._dataProviderChangedHandler = function() {
		SrcMeasureShelfMediator.superclass._dataProviderChangedHandler.apply(this, arguments);

        this._view.deactivateAnimation();
		var model = this._getModel(AppConst.MODEL_GRACE);

		this._view.addSuffix(model.dataProvider.numRows);

		for (var i = 0; i < model.analyses.length; i++) {
			var a = model.analyses[i];
			if (a.analysisType === AnalysisType.MEASURE) {
				this._view.addCard(a);
			}
		}
        this._view.activateAnimation();
	};
})(jQuery);
