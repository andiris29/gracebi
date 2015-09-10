(function($) {

	var vc = sap.viz.container;

	vc.declare("sap.viz.container.grace.views.ColumnMarkerMediator");

	var AppConst = vc.grace.constants.AppConst;
	var DataProviderType = vc.grace.constants.DataProviderType;
	/**
	 * App Mediator.
	 */
	var ColumnMarkerMediator = vc.grace.views.ColumnMarkerMediator = function() {
		ColumnMarkerMediator.superclass.constructor.apply(this, arguments);
	};

	vc.extend(ColumnMarkerMediator, vc.grace.views.ColumnContainerMediatorBase);

	ColumnMarkerMediator.prototype.init = function() {
		ColumnMarkerMediator.superclass.init.apply(this, arguments);
	}

})(jQuery);
