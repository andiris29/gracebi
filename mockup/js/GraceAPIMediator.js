(function($) {

	var vc = sap.viz.container;

	vc.declare("sap.viz.container.grace.GraceAPIMediator");

	var AppConst = vc.grace.constants.AppConst;
	var DataProviderType = vc.grace.constants.DataProviderType;
	/**
	 * App Mediator.
	 */
	var GraceAPIMediator = sap.viz.container.grace.GraceAPIMediator = function() {
		GraceAPIMediator.superclass.constructor.apply(this, arguments);
	};

	vc.extend(GraceAPIMediator, vc.common.mvc.ViewMediator);

	GraceAPIMediator.prototype.rowBasedDataProvider = function(dataProvider, idToName) {
		this._action(AppConst.ACTION_CHANGE_DATA_PROVIDER, {
			type : DataProviderType.ROW_BASED,
			dataProvider : dataProvider,
			idToName : idToName
		});
	};

})(jQuery);
