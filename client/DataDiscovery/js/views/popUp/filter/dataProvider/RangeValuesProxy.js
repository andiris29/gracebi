(function($) {
	var grace = andrea.grace;
	var NullValue = grace.models.value.NullValue;

	andrea.blink.declare('andrea.grace.views.popUp.filter.dataProvider.RangeValuesProxy');
	var RangeValuesProxy = grace.views.popUp.filter.dataProvider.RangeValuesProxy = function(filter, hasNull) {
		this.filter = filter
		// For null checkbox
		this._hasNull = hasNull;
	};
	RangeValuesProxy.prototype.from = function(value) {
		return this.filter.from.apply(this.filter, arguments);
	};
	RangeValuesProxy.prototype.to = function(value) {
		return this.filter.to.apply(this.filter, arguments);
	};
	RangeValuesProxy.prototype.min = function(value) {
		return this.filter.min.apply(this.filter, arguments);
	};
	RangeValuesProxy.prototype.max = function(value) {
		return this.filter.max.apply(this.filter, arguments);
	};
	RangeValuesProxy.prototype.getNullItem = function() {
		if (this._hasNull) {
			NullValue.instance();
		} else {
			return null;
		}
	};
	RangeValuesProxy.prototype.getMinCaption = function(value) {
		return this.filter.fromQuantified(this.min()).caption();
	};
	RangeValuesProxy.prototype.getMaxCaption = function(value) {
		return this.filter.fromQuantified(this.max()).caption();
	};
})(jQuery);
