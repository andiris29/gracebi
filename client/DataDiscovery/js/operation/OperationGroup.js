(function($) {
    var grace = andrea.grace;

    var OperationType = grace.operation.OperationType;
    var Operation = grace.operation.Operation;
    var OperationFactory = grace.operation.OperationFactory;
    var OperationClassification = grace.operation.OperationClassification;
    var OperationPriorityBaseline = grace.operation.OperationPriorityBaseline;

    andrea.blink.declare("andrea.grace.operation.OperationGroup");
    var OperationGroup = grace.operation.OperationGroup = function(ids) {
        this._operations = null;
        this._typeToOperation = null;

        this._initialize(ids);
    };
    OperationGroup.createByTypes = function(types, baseline) {
        if (baseline) {
            baseline = OperationPriorityBaseline.DISPLAY_ONLY;
        }

        var ids = [];
        for (var i = 0; i < types.length; i++) {
            var o = OperationFactory.produce(types[i]);
            ids.push(o.id);
        }
        return new OperationGroup(ids);
    };
    OperationGroup.createByClassification = function(classification, excludes) {
        var types = Operation.getTypes(classification);
        if (excludes) {
            excludes.splice(0, 0, types);
            types = _.without.apply(null, excludes);
        }
        return OperationGroup.createByTypes(types);
    };
    OperationGroup.prototype._initialize = function(ids) {
        this._operations = [];
        this._typeToOperation = {};

        if (!ids) {
            return;
        }

        var i;

        for ( i = 0; i < ids.length; i++) {
            var id = ids[i];
            var o = OperationFactory.get(id);

            this._operations.push(o);
            this._typeToOperation[o.type] = o;
        }
    };
    OperationGroup.prototype.operations = function() {
        return this._operations;
    };

    OperationGroup.prototype.mapIDs = function() {
        return _.map(this._operations, function(o) {
            return o.id;
        });
    };
    OperationGroup.prototype.mapNames = function() {
        return _.map(this._operations, function(o) {
            return o.name;
        });
    };
    OperationGroup.prototype.mapAbbrs = function() {
        return _.map(this._operations, function(o) {
            return o.abbreviation;
        });
    };
    OperationGroup.prototype.get = function(type) {
        return this._typeToOperation[type];
    };
    OperationGroup.prototype.ascend = function() {
        return this.get(OperationType.SORT_ASCEND) || this.get(OperationType.SORT_ALPHABET_ASCEND);
    };
    OperationGroup.prototype.descend = function() {
        return this.get(OperationType.SORT_DESCEND) || this.get(OperationType.SORT_ALPHABET_DESCEND);
    };
    OperationGroup.prototype.has = function(type) {
        return this._typeToOperation[type] !== undefined;
    };
    OperationGroup.prototype.hasClassification = function(classification) {
        return _.map(this._operations, function(o) {
            return o.classification;
        }).indexOf(classification) != -1;
    };
    OperationGroup.prototype.calculator = function() {
        if (this.has(OperationType.CALC_COUNT)) {
            return new grace.calculator.Count();
        } else if (this.has(OperationType.CALC_UNIQ_COUNT)) {
            return new grace.calculator.UniqCount();
        } else if (this.has(OperationType.CALC_SUM)) {
            return new grace.calculator.Sum();
        } else if (this.has(OperationType.CALC_AVG)) {
            return new grace.calculator.Avg();
        } else if (this.has(OperationType.CALC_MAX)) {
            return new grace.calculator.Max();
        } else if (this.has(OperationType.CALC_MIN)) {
            return new grace.calculator.Min();
        }
        return null;
    };
    OperationGroup.prototype.addOperation = function(id) {
        var newOperation = OperationFactory.get(id);

        this._operations = _.filter(this._operations, function(o) {
            return !OperationClassification.exclusive(o.classification, newOperation.classification);
        });
        this._operations.push(newOperation);
    };
    OperationGroup.prototype.removeOperation = function(id) {
        var operation = OperationFactory.get(id);
        this._operations = _.without(this._operations, operation);
        delete this._typeToOperation[operation.type];
    };
    OperationGroup.toJSON = function(instance) {
        return {
            '_operations' : grace.utils.SerializeUtil.batchToJSON(instance._operations, Operation.toJSON),
            '_typeToOperation' : instance._typeToOperation
        };
    };
    OperationGroup.fromJSON = function(json) {
        var instance = new OperationGroup();
        instance._operations = grace.utils.SerializeUtil.batchFromJSON(json._operations, Operation.fromJSON);
        instance._typeToOperation = json._typeToOperation;
        return instance;
    };
})(jQuery);
