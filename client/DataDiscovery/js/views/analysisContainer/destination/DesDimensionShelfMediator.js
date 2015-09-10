(function($) {

	var grace = andrea.grace;

	andrea.blink.declare("andrea.grace.views.analysisContainer.destination.DesDimensionShelfMediator");

	var AppConst = grace.constants.AppConst;
	/**
	 * App Mediator.
	 */
	var DesDimensionShelfMediator = grace.views.analysisContainer.destination.DesDimensionShelfMediator = function() {
		DesDimensionShelfMediator.superclass.constructor.apply(this, arguments);
	};

	andrea.blink.extend(DesDimensionShelfMediator, grace.views.analysisContainer.supportClasses.ShelfBaseMediator);

	DesDimensionShelfMediator.prototype.init = function() {
		DesDimensionShelfMediator.superclass.init.apply(this, arguments);
	}

})(jQuery);
