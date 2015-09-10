(function() {
	var grace = andrea.grace;
	andrea.blink.declare("andrea.grace.filter.RangeFilter");

	var QuantifiedHelper = grace.models.value.supportClasses.QuantifiedHelper;

	var RangeFilter = grace.filter.RangeFilter = function(optionValues, nullable, quantifiedType) {
		this._from = null;
		this._to = null;
		this._min = null;
		this._max = null;
		this.optionValues(optionValues);

		this.nullable = nullable;
		this._quantifiedType = quantifiedType;
	};
	andrea.blink.extend(RangeFilter, grace.filter.IFilter);

	RangeFilter.prototype.optionValues = function(optionValues) {
		this._from = Number.MAX_VALUE;
		this._to = -Number.MAX_VALUE;
		_.each(optionValues, $.proxy(function(value) {
			var quantified = value.quantified();
			this._from = Math.min(this._from, quantified);
			this._to = Math.max(this._to, quantified);
		}, this));
		this._min = this._from;
		this._max = this._to;
	};

	RangeFilter.prototype.type = function() {
		return 'RangeFilter';
	};
	/**
	 *
	 * @param {Object} value
	 * @return The result of filter
	 * 	true: use normally
	 * 	false: will be skip
	 */
	RangeFilter.prototype.filter = function(value) {
		var quantified = value.quantified();
		return this._max >= quantified && this._min <= quantified;
	};

	RangeFilter.prototype.from = function(value) {
		return this._from;
	};
	RangeFilter.prototype.to = function(value) {
		return this._to;
	};
	RangeFilter.prototype.min = function(value) {
		if (arguments.length > 0) {
			this._min = value;
			return this;
		} else {
			return this._min;
		}
	};
	RangeFilter.prototype.max = function(value) {
		if (arguments.length > 0) {
			this._max = value;
			return this;
		} else {
			return this._max;
		}
	};
	RangeFilter.prototype.fromQuantified = function(quantified) {
		return QuantifiedHelper.fromQuantified(this._quantifiedType, quantified);
	};

	RangeFilter.toJSON = function(instance) {
		return {
			'type' : instance.type(),
			'from' : instance._from,
			'to' : instance._to,
			'min' : instance._min,
			'max' : instance._max,
			'nullable' : instance.nullable,
			'quantifiedType' : instance._quantifiedType
		};
	};
	RangeFilter.fromJSON = function(json) {
		var instance = new RangeFilter([], json.nullable, json.quantifiedType);
		instance._from = json.from;
		instance._to = json.to;
		instance._min = json.min;
		instance._max = json.max;
		return instance;
	};
})();
