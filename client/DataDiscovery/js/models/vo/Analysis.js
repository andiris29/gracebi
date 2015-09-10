(function() {

	var grace = andrea.grace;

	andrea.blink.declare('andrea.grace.models.vo.Analysis');

	var ShelfType = grace.constants.ShelfType;
	var DataConvertUtil = grace.utils.DataConvertUtil;
	var ValueType = grace.constants.ValueType;

	var Analysis = grace.models.vo.Analysis = function(id) {
		this.id = id ? id : _.uniqueId('analysisID_');
		this.index = null;
		this.name = null;

		this._valueType = null;
		this.quantifiable = false;

		this.analysisType = null;
		// For dimension
		this.numUniqueValue/*Number*/ = null;
		// For dimension, DATE
		this.dateSpan/*Number*/ = null;
	};
	Analysis.prototype.valueType = function(value) {
		if (arguments.length > 0) {
			this._valueType = value;
			this.quantifiable = this._valueType === ValueType.NUMBER || this._valueType === ValueType.DATE;
			return this;
		} else {
			return this._valueType;
		}
	}
})();
