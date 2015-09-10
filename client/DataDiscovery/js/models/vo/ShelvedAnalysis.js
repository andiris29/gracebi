(function() {
    var grace = andrea.grace;

    var ValueType = grace.constants.ValueType;
    var AnalysisType = grace.constants.AnalysisType;
    var OperationClassification = grace.operation.OperationClassification;

    andrea.blink.declare("andrea.grace.models.vo.ShelvedAnalysis");
    var ShelvedAnalysis = grace.models.vo.ShelvedAnalysis = function(id, source) {
        this.id = id;
        this.source/*Analysis*/ = source;

        // For des shelves
        this.operationGroup = null;
        this.visualized = false;
        this.numPartialVisualized = 0;
        // For proc shelves
        this.filter = null;
    };
    ShelvedAnalysis.prototype.isDateSeries = function() {
        return this.source.valueType() === ValueType.DATE && this.operationGroup.hasClassification(OperationClassification.DRILL);
    };

    ShelvedAnalysis.prototype.multiply = function(instance) {
        // TODO Build a full multiply logic for extensibility
        var result = {};

        if (instance && instance.source && instance.source.numUniqueValue) {
            result.numUniqueValue = this.source.numUniqueValue * instance.source.numUniqueValue;
        } else {
            result.numUniqueValue = this.source.numUniqueValue;
        }
        return result;
    };

    ShelvedAnalysis.toJSON = function(instance) {
        var json = {
            'id' : instance.id,
            'source' : grace.models.vo.Analysis.toJSON(instance.source),
            'operationGroup' : grace.operation.OperationGroup.toJSON(instance.operationGroup),
            'visualized' : instance.visualized,
            'numPartialVisualized' : instance.numPartialVisualized
        };
        if (instance.filter) {
            json.filter = grace.filter.IFilter.toJSON(instance.filter);
        }
        return json;
    };
    ShelvedAnalysis.fromJSON = function(json) {
        var instance = new ShelvedAnalysis();
        instance.id = json.id;
        instance.source = grace.models.vo.Analysis.fromJSON(json.source);
        instance.operationGroup = grace.operation.OperationGroup.fromJSON(json.operationGroup);
        instance.visualized = json.visualized;
        instance.numPartialVisualized = json.numPartialVisualized;
        if (json.filter) {
            instance.filter = grace.filter.IFilter.fromJSON(json.filter);
        }
        return instance;
    };
})();
