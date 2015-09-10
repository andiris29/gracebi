(function($) {

	var grace = andrea.grace;

	andrea.blink.declare("andrea.grace.views.analysisContainer.source.SrcDimensionShelfMediator");

	var AppConst = grace.constants.AppConst;
	var AnalysisType = andrea.grace.constants.AnalysisType;
	/**
	 * App Mediator.
	 */
	var SrcDimensionShelfMediator = grace.views.analysisContainer.source.SrcDimensionShelfMediator = function() {
		SrcDimensionShelfMediator.superclass.constructor.apply(this, arguments);
	};

	andrea.blink.extend(SrcDimensionShelfMediator, grace.views.analysisContainer.supportClasses.ShelfBaseMediator);

	SrcDimensionShelfMediator.prototype.init = function() {
		SrcDimensionShelfMediator.superclass.init.apply(this, arguments);
	}

	SrcDimensionShelfMediator.prototype._dataProviderChangedHandler = function() {
		SrcDimensionShelfMediator.superclass._dataProviderChangedHandler.apply(this, arguments);

		var model = this._getModel(AppConst.MODEL_GRACE);
		for (var i = 0; i < model.analyses.length; i++) {
			var a = model.analyses[i];
			if (a.analysisType === AnalysisType.DIMENSION) {
				this._view.addCard(a);
			}
		}

	}
})(jQuery);
