(function($) {

	var grace = andrea.grace;

	andrea.blink.declare("andrea.grace.views.analysisContainer.destination.DesMeasureShelfMediator");

	var AppConst = grace.constants.AppConst;
	/**
	 * App Mediator.
	 */
	var DesMeasureShelfMediator = grace.views.analysisContainer.destination.DesMeasureShelfMediator = function() {
		DesMeasureShelfMediator.superclass.constructor.apply(this, arguments);
	};

	andrea.blink.extend(DesMeasureShelfMediator, grace.views.analysisContainer.supportClasses.ShelfBaseMediator);

	DesMeasureShelfMediator.prototype.init = function() {
		DesMeasureShelfMediator.superclass.init.apply(this, arguments);
	};

    DesMeasureShelfMediator.prototype._modelAnalyses = function() {
        return this._model.analysisDatas();
    };
})(jQuery);
