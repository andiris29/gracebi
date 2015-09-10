(function() {
	var vc = sap.viz.container;
	vc.declare("sap.viz.container.grace.Grace");

	var App = sap.viz.container.common.mvc.App;
	var AppConst = sap.viz.container.grace.constants.AppConst;

	var Grace = vc.grace.Grace = function(div) {
		this._div = div;

		this._viewColumnList = null;
		this._viewColumnXAxis = null;
		this._viewColumnYAxis = null;

		this._viewVizContainer = null;

		this._startup();
	};

	/**
	 *
	 * @param {Object} dataProvider
	 * [{
	 * 		columnID1 : data1,
	 * 		columnID2 : data2
	 * 	}]
	 *
	 * @param {Object} idToName
	 * {
	 * 		columnID1 : columnName1,
	 * 		columnID2 : columnName2
	 * 	}
	 *
	 */
	Grace.prototype.rowBasedDataProvider = function(dataProvider, idToName) {
		this._apiMediator.rowBasedDataProvider(dataProvider, idToName);
	};

	Grace.prototype._startup = function() {
		var app = new App();

		var view = null;
		var mediator = null;

		this._viewColumnList = new sap.viz.container.grace.views.ui.ColumnList($("#divDimensions")[0]);
		this._viewColumnXAxis = new sap.viz.container.grace.views.ui.ColumnXAxis($("#divColumnXAxis")[0]);
		this._viewColumnYAxis = new sap.viz.container.grace.views.ui.ColumnYAxis($("#divColumnYAxis")[0]);
		this._viewColumnMarker = new sap.viz.container.grace.views.ui.ColumnMarker($("#divColumnMarker")[0]);

		this._viewVizContainer = new sap.viz.container.grace.views.ui.VizContainer($("#divVizContainer")[0]);
		// Models
		app.registerModel(AppConst.MODEL_GRACE, new vc.grace.models.GraceModel());

		// Actions
		app.registerAction(AppConst.ACTION_CHANGE_DATA_PROVIDER, vc.grace.actions.ChangeDataProviderAction);
		app.registerAction(AppConst.ACTION_CHANGE_SELECTED_COLUMNS, vc.grace.actions.ChangeSelectedColumnAction);

		// Views
		// var appView = this._appView = new sap.viz.container.views.ui.AppView(this._div);

		// Mediators
		mediator = new sap.viz.container.grace.GraceAPIMediator();
		app.registerViewMediator(AppConst.MEDIATOR_GRACE_API, mediator);
		this._apiMediator = mediator;

		mediator = new sap.viz.container.grace.views.ColumnListMediator(this._viewColumnList);
		app.registerViewMediator(AppConst.MEDIATOR_COLUMN_LIST, mediator);
		mediator = new sap.viz.container.grace.views.ColumnXAxisMediator(this._viewColumnXAxis);
		app.registerViewMediator(AppConst.MEDIATOR_COLUMN_X_AXIS, mediator);
		mediator = new sap.viz.container.grace.views.ColumnYAxisMediator(this._viewColumnYAxis);
		app.registerViewMediator(AppConst.MEDIATOR_COLUMN_Y_AXIS, mediator);
		mediator = new sap.viz.container.grace.views.ColumnMarkerMediator(this._viewColumnMarker);
		app.registerViewMediator(AppConst.MEDIATOR_COLUMN_MARKER, mediator);

		mediator = new sap.viz.container.grace.views.VizContainerMediator(this._viewVizContainer);
		app.registerViewMediator(AppConst.MEDIATOR_VIZ_CONTAINER, mediator);
		// AppMediator
		// mediator = new sap.viz.container.views.AppMediator(appView);
		// app.registerViewMediator(AppConst.MEDIATOR_VIZ_CONTAINER, mediator);

		// this._apiMediator.bootstrap(this._uiConfig);

		var _this = this;
		var invalidateSize = false;
		$(window).resize(function() {
			if (!invalidateSize) {
				setTimeout(function() {
					invalidateSize = false;
					_this._validateSize();
				}, 1000 / 24);
			}
			invalidateSize = true;
		});
		this._validateSize();
	};

	Grace.prototype._validateSize = function() {
		var w = $(this._div).width();
		var h = $(this._div).height();

		// this._appView.size({
		// width : w,
		// height : h
		// });

		// TODO Move to chart self
		// this._chartMediator.chartTypeChanged();
	};
	Grace.prototype._createChildDiv = function(parent) {
		var div = document.createElement('div');
		if (parent) {
			$(div).appendTo(parent);
		}

		return div;
	};
})();
