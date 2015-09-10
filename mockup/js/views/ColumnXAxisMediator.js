(function($) {

	var vc = sap.viz.container;

	vc.declare("sap.viz.container.grace.views.ColumnXAxisMediator");

	var AppConst = vc.grace.constants.AppConst;
	var DataProviderType = vc.grace.constants.DataProviderType;
	/**
	 * App Mediator.
	 */
	var ColumnXAxisMediator = vc.grace.views.ColumnXAxisMediator = function() {
		ColumnXAxisMediator.superclass.constructor.apply(this, arguments);
	};

	vc.extend(ColumnXAxisMediator, vc.grace.views.ColumnContainerMediatorBase);

	ColumnXAxisMediator.prototype.init = function() {
		ColumnXAxisMediator.superclass.init.apply(this, arguments);
	}

})(jQuery);
