(function($) {

	var vc = sap.viz.container;

	vc.declare("sap.viz.container.grace.views.ColumnYAxisMediator");

	var AppConst = vc.grace.constants.AppConst;
	var DataProviderType = vc.grace.constants.DataProviderType;
	/**
	 * App Mediator.
	 */
	var ColumnYAxisMediator = vc.grace.views.ColumnYAxisMediator = function() {
		ColumnYAxisMediator.superclass.constructor.apply(this, arguments);
	};

	vc.extend(ColumnYAxisMediator, vc.grace.views.ColumnContainerMediatorBase);

	ColumnYAxisMediator.prototype.init = function() {
		ColumnYAxisMediator.superclass.init.apply(this, arguments);
	}

})(jQuery);
