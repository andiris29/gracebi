(function($) {

	var grace = andrea.grace;

	andrea.blink.declare("andrea.grace.views.analysisContainer.processor.FilterShelfMediator");

	var AppConst = grace.constants.AppConst;
	/**
	 * App Mediator.
	 */
	var FilterShelfMediator = grace.views.analysisContainer.processor.FilterShelfMediator = function() {
		FilterShelfMediator.superclass.constructor.apply(this, arguments);
	};

	andrea.blink.extend(FilterShelfMediator, grace.views.analysisContainer.supportClasses.ShelfBaseMediator);

	FilterShelfMediator.prototype.init = function() {
		FilterShelfMediator.superclass.init.apply(this, arguments);
	}

})(jQuery);
