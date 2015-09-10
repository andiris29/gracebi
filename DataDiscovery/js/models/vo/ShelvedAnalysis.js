(function($) {
    var grace = andrea.grace;

    var DataType = grace.constants.DataType;
    var AnalysisType = grace.constants.AnalysisType;
    var OperationClassification = grace.operation.OperationClassification;

    andrea.blink.declare("andrea.grace.models.vo.ShelvedAnalysis");
    var ShelvedAnalysis = grace.models.vo.ShelvedAnalysis = function(id, source) {
        this.id = id;
        this.source/*Analysis*/ = source;

        this.operationGroup = null;

        this.visualized = false;
        this.numPartialVisualized = 0;
    };
    ShelvedAnalysis.prototype.isDateSeries = function() {
        return this.source.dataType === DataType.DATE && this.operationGroup.hasClassification(OperationClassification.DRILL)
    };

    ShelvedAnalysis.prototype.multiply = function(sa) {
        // TODO Build a full multiply logic for extensibility
        var result = {};

        if (sa && sa.source && sa.source.numUniqueValue) {
            result.numUniqueValue = this.source.numUniqueValue * sa.source.numUniqueValue;
        } else {
            result.numUniqueValue = this.source.numUniqueValue
        }
        return result;
    };
})(jQuery);
