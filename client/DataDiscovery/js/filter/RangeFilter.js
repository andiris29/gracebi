(function() {
	var grace = andrea.grace;
	andrea.blink.declare("andrea.grace.filter.RangeFilter");

	var RangeFilter = grace.filter.RangeFilter = function(optionValues, nullable, parseQuantified) {
		this._from = Number.MAX_VALUE;
		this._to = -Number.MAX_VALUE;

		_.each(optionValues, $.proxy(function(value) {
			var quantified = value.quantified();
			this._from = Math.min(this._from, quantified);
			this._to = Math.max(this._to, quantified);
		}, this));

		this._min = this._from;
		this._max = this._to;

		this.nullable = nullable;
		this._parseQuantified = parseQuantified;
	};
	andrea.blink.extend(RangeFilter, grace.filter.IFilter);

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
	RangeFilter.prototype.parseQuantified = function(quantified) {
		return this._parseQuantified.call(null, quantified);
	}
})();
