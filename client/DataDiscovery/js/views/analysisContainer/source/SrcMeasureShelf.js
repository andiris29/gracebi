(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.views.analysisContainer.source.SrcMeasureShelf");

    var AnalysisType = grace.constants.AnalysisType;
    var ShelfType = grace.constants.ShelfType;
    var OperationClassification = grace.operation.OperationClassification;
    var OperationType = grace.operation.OperationType;
    var OperationGroup = grace.operation.OperationGroup;

    var SrcMeasureShelf = grace.views.analysisContainer.source.SrcMeasureShelf = function(dom) {
        SrcMeasureShelf.superclass.constructor.apply(this, arguments);

        this._setTitle("指标");
    };
    andrea.blink.extend(SrcMeasureShelf, grace.views.analysisContainer.supportClasses.ShelfBase);

    SrcMeasureShelf.prototype._initialization = function() {
        this._type = ShelfType.SRC_MEA;
        this._layout = "vertical";
    };
    // SrcMeasureShelf.prototype._getOperationInfo = function(a) {
        // return {
            // 'availableOGs' : SrcMeasureShelf.OGS_DEFAULT,
            // 'defaultTypes' : []
        // };
    // }
    // SrcMeasureShelf.OGS_DEFAULT = null;
// 
    // SrcMeasureShelf._loadClass = function() {
        // var availableOGs;
        // // OGS_DEFAULT
        // availableOGs = [];
        // availableOGs.push(OperationGroup.createByTypes([OperationType.CARD_ADD_TO_MEASURE]));
        // SrcMeasureShelf.OGS_DEFAULT = availableOGs;
    // };
    // SrcMeasureShelf._loadClass();

})();
