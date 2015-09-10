(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.views.analysisContainer.destination.DesMeasureShelf");

    var AnalysisType = grace.constants.AnalysisType;
    var ShelfType = grace.constants.ShelfType;
    var OperationType = grace.operation.OperationType;
    var OperationGroup = grace.operation.OperationGroup;
    var OperationClassification = grace.operation.OperationClassification;
    var OperationFactory = grace.operation.OperationFactory;
    var OT = OperationType;
    var OG = OperationGroup;
    var OC = OperationClassification;

    var DesMeasureShelf = grace.views.analysisContainer.destination.DesMeasureShelf = function(dom) {
        DesMeasureShelf.superclass.constructor.apply(this, arguments);

        this._setTitle("分析指标");
        this._setRequired(true);
    };
    andrea.blink.extend(DesMeasureShelf, grace.views.analysisContainer.supportClasses.ShelfBase);

    DesMeasureShelf.prototype._initialization = function() {
        this._type = ShelfType.DES_VALUE;
        this._layout = "horizontal";

    };
    DesMeasureShelf.prototype._getOperationInfo = function(a) {
        var availableOGs;
        var defaultTypes;
        if (a.analysisType === AnalysisType.DIMENSION) {
            availableOGs = DesMeasureShelf.OGS_DIMENSION;
            defaultTypes = [OT.CALC_UNIQ_COUNT];
        } else if (a.analysisType === AnalysisType.MEASURE) {
            availableOGs = DesMeasureShelf.OGS_MEASURE;
            defaultTypes = [OT.CALC_SUM];
        }

        return {
            'availableOGs' : availableOGs,
            'defaultTypes' : defaultTypes
        };
    };

    DesMeasureShelf.OGS_DIMENSION = null;
    DesMeasureShelf.OGS_MEASURE = null;
    DesMeasureShelf._loadClass = function() {
        var availableOGs;
        // OGS_DIMENSION
        availableOGs = [];
        availableOGs.push(OG.createByTypes([OT.CALC_UNIQ_COUNT, OT.CALC_COUNT]));
        availableOGs.push(OG.createByTypes([OT.SORT_NONE, OT.SORT_ASCEND, OT.SORT_DESCEND]));
        availableOGs.push(OG.createByTypes([OT.CARD_REMOVE]));
        DesMeasureShelf.OGS_DIMENSION = availableOGs;
        // OGS_MEASURE
        availableOGs = [];
        availableOGs.push(OG.createByTypes([OT.CALC_SUM, OT.CALC_AVG, OT.CALC_MAX, OT.CALC_MIN]));
        availableOGs.push(OG.createByTypes([OT.SORT_NONE, OT.SORT_ASCEND, OT.SORT_DESCEND]));
        availableOGs.push(OG.createByTypes([OT.CARD_REMOVE]));
        DesMeasureShelf.OGS_MEASURE = availableOGs;
    };
    DesMeasureShelf._loadClass();
})();
