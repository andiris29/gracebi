(function($) {

	var grace = andrea.grace;

	andrea.blink.declare("andrea.grace.models.DataDiscoveryModel");

	var ShelfType = grace.constants.ShelfType;
	var AppConst = andrea.grace.constants.AppConst;
	var VizType = grace.constants.VizType;
	/**
	 * App Model host all widgets (including chart, cross table and other widget).
	 */
	var DataDiscoveryModel = grace.models.DataDiscoveryModel = function() {
		DataDiscoveryModel.superclass.constructor.apply(this, arguments);
		DataDiscoveryModel._instance = this;

		this.raw/*Object*/ = null;
		this.analyses/*Array.<Analysis>*/ = null;
		this.dataProvider = null;

		this._analysisFilters/*Array.<ShelvedAnalysis>*/ = [];
		this._analysisDimesions/*Array.<ShelvedAnalysis>*/ = [];
		this._analysisDatas/*Array.<ShelvedAnalysis>*/ = [];

		this._vizType = VizType.RECOMMEND;
	};
	andrea.blink.extend(DataDiscoveryModel, andrea.blink.mvc.Model);

	// TODO Remove this method after refator view mediator, static method for view get model currently
	DataDiscoveryModel._instance = null;
	DataDiscoveryModel.instance = function() {
		return DataDiscoveryModel._instance;
	}
	/**
	 * A short cut way for view-view communication
	 * TODO Refactor it
	 */
	DataDiscoveryModel.prototype.viewNotify = function(name, data) {
		this._notify(name, data);
	}
	/**
	 *
	 */
	DataDiscoveryModel.prototype.setDataProvider = function(raw, analyses, dataProvider) {
		this.raw = raw;
		this.analyses = analyses;
		this.dataProvider = dataProvider;

		this._vizType = VizType.RECOMMEND;

		this._analysisFilters = [];
		this._analysisDimesions = [];
		this._analysisDatas = [];

		this._notify(AppConst.NOTIFICATION_DATA_PROVIDER_CHANGED);
	}	/**
	 *
	 */
	DataDiscoveryModel.prototype.vizType = function(value) {
		if (arguments.length > 0) {
			if (this._vizType !== value) {
				this._vizType = value;
				this._deferNotify(AppConst.NOTIFICATION_VIZ_CONTEXT_CHANGED);
			}
		} else {
			return this._vizType;
		}
	}
	DataDiscoveryModel.prototype.analysisFilters = function(value) {
		if (arguments.length > 0) {
			this._analysisFilters = value;
			this._deferNotify(AppConst.NOTIFICATION_VIZ_CONTEXT_CHANGED);
		} else {
			return this._analysisFilters;
		}
	}
	DataDiscoveryModel.prototype.analysisDimesions = function(value) {
		if (arguments.length > 0) {
			this._analysisDimesions = value;
			this._deferNotify(AppConst.NOTIFICATION_VIZ_CONTEXT_CHANGED);
		} else {
			return this._analysisDimesions;
		}
	}
	DataDiscoveryModel.prototype.analysisDatas = function(value) {
		if (arguments.length > 0) {
			this._analysisDatas = value;
			this._deferNotify(AppConst.NOTIFICATION_VIZ_CONTEXT_CHANGED);
		} else {
			return this._analysisDatas;
		}
	}
	DataDiscoveryModel.prototype.invalidateShelvedAnalysis = function() {
		this._deferNotify(AppConst.NOTIFICATION_VIZ_CONTEXT_APPLIED);
	}
	/**
	 *
	 */	DataDiscoveryModel.prototype.getAnalyses = function(ids) {
		var as = [];
		for (var i = 0; i < ids.length; i++) {
			as.push(this.getAnalysis(ids[i]));
		}
		return as;
	}
	DataDiscoveryModel.prototype.getAnalysis = function(id) {
		return this._get(id, this.analyses);
	}
	DataDiscoveryModel.prototype.getShelvedAnalysis = function(id) {
		var sa = this._get(id, this._analysisFilters);
		if (!sa) {
			sa = this._get(id, this._analysisDimesions);
		}
		if (!sa) {
			sa = this._get(id, this._analysisDatas);
		}
		return sa;
	}
	DataDiscoveryModel.prototype._get = function(id, items) {
		for (var i = 0; i < items.length; i++) {
			if (items[i].id === id) {
				return items[i];
			}
		}
		return null;
	}
})(jQuery);
