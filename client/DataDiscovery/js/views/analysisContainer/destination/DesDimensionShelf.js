(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.views.analysisContainer.destination.DesDimensionShelf");

    var AnalysisType = grace.constants.AnalysisType;
    var ValueType = grace.constants.ValueType;
    var ShelfType = grace.constants.ShelfType;
    var OperationType = grace.operation.OperationType;
    var OperationGroup = grace.operation.OperationGroup;
    var OperationClassification = grace.operation.OperationClassification;
    var OT = OperationType;
    var OG = OperationGroup;
    var OC = OperationClassification;

    var DesDimensionShelf = grace.views.analysisContainer.destination.DesDimensionShelf = function(dom) {
        DesDimensionShelf.superclass.constructor.apply(this, arguments);

        this._setTitle("分析维度");
        this._setRequired(true);
    };
    andrea.blink.extend(DesDimensionShelf, grace.views.analysisContainer.supportClasses.ShelfBase);

    DesDimensionShelf.prototype._initialization = function() {
        this._type = ShelfType.DES_DIM;
        this._layout = "horizontal";
    };
    DesDimensionShelf.prototype._getOperationInfo = function(a) {
        var availableOGs;
        var defaultTypes;

        if (a.valueType()=== ValueType.DATE) {
            availableOGs = DesDimensionShelf.OGS_DATE;
            defaultTypes = [OT.SORT_ASCEND];
            if (a.dateSpan < 86400000 * (365 / 2 + 1)) {
                defaultTypes.push(OT.DRILL_DATE);
            } else if (a.dateSpan < 86400000 * (365 * 1)) {
                defaultTypes.push(OT.DRILL_WEEK);
            } else if (a.dateSpan < 86400000 * (365 * 5)) {
                defaultTypes.push(OT.DRILL_MONTH);
            } else {
                defaultTypes.push(OT.DRILL_YEAR);
            }
        } else {
            availableOGs = DesDimensionShelf.OGS_DEFAULT;
            defaultTypes = [OT.SORT_NONE];
        }

        return {
            'availableOGs' : availableOGs,
            'defaultTypes' : defaultTypes
        };
    }
    DesDimensionShelf.OGS_DATE = null;
    DesDimensionShelf.OGS_DEFAULT = null;
    DesDimensionShelf._loadClass = function() {
        var availableOGs;
        // OGS_DATE
        availableOGs = [];
        availableOGs.push(OG.createByTypes([OT.SORT_ASCEND, OT.SORT_DESCEND]));
        availableOGs.push(OG.createByClassification(OC.DRILL));
        availableOGs.push(OG.createByClassification(OC.GROUP));
        DesDimensionShelf.OGS_DATE = availableOGs;
        // OGS_DEFAULT
        availableOGs = [];
        availableOGs.push(OG.createByTypes([OT.SORT_NONE, OT.SORT_ALPHABET_ASCEND, OT.SORT_ALPHABET_DESCEND]));
        DesDimensionShelf.OGS_DEFAULT = availableOGs;
    };
    DesDimensionShelf._loadClass();

})();
