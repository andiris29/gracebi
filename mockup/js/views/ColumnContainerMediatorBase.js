(function($) {

	var vc = sap.viz.container;

	vc.declare("sap.viz.container.grace.views.ColumnContainerMediatorBase");

	var AppConst = vc.grace.constants.AppConst;
	var DataProviderType = vc.grace.constants.DataProviderType;
	var ColumnContainerEvent = vc.grace.views.events.ColumnContainerEvent;

	/**
	 * App Mediator.
	 */
	var ColumnContainerMediatorBase = vc.grace.views.ColumnContainerMediatorBase = function(view) {
		ColumnContainerMediatorBase.superclass.constructor.apply(this, arguments);

		this._view = view;
	};

	vc.extend(ColumnContainerMediatorBase, vc.common.mvc.ViewMediator);

	ColumnContainerMediatorBase.prototype.init = function() {
		var _this = this;

		this._view.addEventListener(ColumnContainerEvent.COLUMN_CHANGED, function(event) {
			_this._action(AppConst.ACTION_CHANGE_SELECTED_COLUMNS, {
				type : event.data.type,
				columnMetadatas : event.data.columnMetadatas
			});
		}, this);

		this._subscribe(AppConst.NOTIFICATION_DATA_PROVIDER_CHANGED, function(notification) {
			_this._dataProviderChangedHandler(notification);
		});
	}
	/**
	 * @protected
	 */
	ColumnContainerMediatorBase.prototype._dataProviderChangedHandler = function(notification) {
		this._view.removeAll();
	}
})(jQuery);
