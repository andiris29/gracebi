(function() {

    var grace = andrea.grace;

    andrea.blink.declare('andrea.grace.models.vo.Analysis');

    var ShelfType = grace.constants.ShelfType;
    var DataConvertUtil = grace.utils.DataConvertUtil;
    var ValueType = grace.constants.ValueType;
    var AnalysisType = grace.constants.AnalysisType;

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
    };

    Analysis.toJSON = function(instance) {
        return {
            'id' : instance.id,
            'index' : instance.index,
            'name' : instance.name,
            '_valueType' : instance._valueType,
            'quantifiable' : instance.quantifiable,
            'analysisType' : instance.analysisType,
            'numUniqueValue' : instance.numUniqueValue,
            'dateSpan' : instance.dateSpan,
        };
    };
    Analysis.fromJSON = function(json) {
        var instance = new Analysis();
        instance.id = json.id;
        instance.index = json.index;
        instance.name = json.name;
        instance._valueType = json._valueType;
        instance.quantifiable = json.quantifiable;
        instance.analysisType = json.analysisType;
        instance.numUniqueValue = json.numUniqueValue;
        instance.dateSpan = json.dateSpan;
        return instance;
    };
})();
