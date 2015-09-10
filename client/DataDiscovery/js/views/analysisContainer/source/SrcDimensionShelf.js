(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.views.analysisContainer.source.SrcDimensionShelf");

    var AnalysisType = grace.constants.AnalysisType;
    var ShelfType = grace.constants.ShelfType;
    var OperationClassification = grace.operation.OperationClassification;
    var OperationType = grace.operation.OperationType;
    var OperationGroup = grace.operation.OperationGroup;

    var SrcDimensionShelf = grace.views.analysisContainer.source.SrcDimensionShelf = function(dom) {
        SrcDimensionShelf.superclass.constructor.apply(this, arguments);

        this._setTitle("纬度");

        $(this._dom).css({
            // "height" : "50%"
        });
    };
    andrea.blink.extend(SrcDimensionShelf, grace.views.analysisContainer.supportClasses.ShelfBase);

    SrcDimensionShelf.prototype._initialization = function() {
        this._type = ShelfType.SRC_DIM;
        this._layout = "vertical";
    };
    // SrcDimensionShelf.prototype._getOperationInfo = function(a) {
        // return {
            // 'availableOGs' : SrcDimensionShelf.OGS_DEFAULT,
            // 'defaultTypes' : []
        // };
    // }
    // SrcDimensionShelf.OGS_DEFAULT = null;
// 
    // SrcDimensionShelf._loadClass = function() {
        // var availableOGs;
        // // OGS_DEFAULT
        // availableOGs = [];
        // availableOGs.push(OperationGroup.createByTypes([OperationType.CARD_ADD_TO_DIMENSION, OperationType.CARD_ADD_TO_MEASURE]));
        // SrcDimensionShelf.OGS_DEFAULT = availableOGs;
    // };
    // SrcDimensionShelf._loadClass();
})();
