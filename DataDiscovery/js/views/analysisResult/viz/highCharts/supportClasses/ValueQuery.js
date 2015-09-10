(function() {
    var grace = andrea.grace;

    var DataType = grace.constants.DataType;
    var OperationType = grace.operation.OperationType;
    var ValueToName = grace.views.analysisResult.viz.highCharts.supportClasses.ValueToName;

    andrea.blink.declare("andrea.grace.views.analysisResult.viz.highCharts.supportClasses.ValueQuery");
    var ValueQuery = andrea.grace.views.analysisResult.viz.highCharts.supportClasses.ValueQuery = function(dataProvider, shelvedAnalysis) {
        this._dataProvider = dataProvider;
        this._sa = shelvedAnalysis;
        this._a = this._sa.source;

        this._names = null;
        this._valueToName = null;

        this._initialize();
    };
    ValueQuery.NULL_NAME = '-';
    ValueQuery.prototype._initialize = function() {
        var source = this._dataProvider.getCUniqueValues(this._a.index);

        if (this._a.dataType === DataType.STRING) {
            this._valueToName = ValueToName.string;
            this._names = this._generateNames(source);
        } else if (this._a.dataType === DataType.NUMBER) {
            this._valueToName = ValueToName.number;
            this._names = this._generateNames(source);
        } else if (this._a.dataType === DataType.DATE) {
            // Drill
            if (this._sa.operationGroup.has(OperationType.DRILL_YEAR)) {
                this._valueToName = ValueToName.dateDrillYear;
                this._names = this._generateDateDrillNames(source, function(transition, to) {
                    return transition.getFullYear() < to.getFullYear();
                }, function(transition) {
                    transition.setFullYear(transition.getFullYear() + 1);
                });
            } else if (this._sa.operationGroup.has(OperationType.DRILL_MONTH)) {
                this._valueToName = ValueToName.dateDrillMonth;
                this._names = this._generateDateDrillNames(source, function(transition, to) {
                    return transition.getFullYear() * 12 + transition.getMonth() < to.getFullYear() * 12 + to.getMonth();
                }, function(transition) {
                    transition.setMonth(transition.getMonth() + 1);
                });
            } else if (this._sa.operationGroup.has(OperationType.DRILL_WEEK)) {
                this._valueToName = ValueToName.dateDrillWeek;
                this._names = this._generateDateDrillNames(source, function(transition, to) {
                    return Math.floor(transition.getMonsday().getTime() / 7 / 24 / 3600 / 1000) < Math.floor(to.getMonsday().getTime() / 7 / 24 / 3600 / 1000)
                }, function(transition) {
                    transition.setDate(transition.getDate() + 7);
                });
            } else if (this._sa.operationGroup.has(OperationType.DRILL_DATE)) {
                this._valueToName = ValueToName.dateDrillDate;
                this._names = this._generateDateDrillNames(source, function(transition, to) {
                    return Math.floor(transition.getTime() / 24 / 3600 / 1000) < Math.floor(to.getTime() / 24 / 3600 / 1000)
                }, function(transition) {
                    transition.setDate(transition.getDate() + 1);
                });
            }
            // Group
            else if (this._sa.operationGroup.has(OperationType.GROUP_MONTH)) {
                this._valueToName = ValueToName.dateGroupMonth;
                this._names = this._generateSortedNames(source, _.clone(Date.monthNames));
            } else if (this._sa.operationGroup.has(OperationType.GROUP_DATE)) {
                this._valueToName = ValueToName.dateGroupDate;
                this._names = this._generateSortedNames(source, _.clone(Date.dateNames));
            } else if (this._sa.operationGroup.has(OperationType.GROUP_DAY)) {
                this._valueToName = ValueToName.dateGroupDay;
                this._names = this._generateSortedNames(source, _.clone(Date.dayNames));
            } else if (this._sa.operationGroup.has(OperationType.GROUP_HOUR)) {
                this._valueToName = ValueToName.dateGroupHour;
                this._names = this._generateSortedNames(source, _.clone(Date.hourNames));
            }
        }
    }

    ValueQuery.prototype._generateNames = function(source) {
        var sourceWithoutNull = _.without(source, null);
        var hasNull = source.length !== sourceWithoutNull.length;
        // TODO Performance optimize
        if (this._sa.operationGroup.ascend()) {
            sourceWithoutNull.sort();
        } else if (this._sa.operationGroup.descend()) {
            sourceWithoutNull.sort();
            sourceWithoutNull.reverse();
        }

        var names = sourceWithoutNull;
        if (hasNull) {
            names.push(this.valueToName(null));
        }
        return names;
    };
    ValueQuery.prototype._generateDateDrillNames = function(source, loopCondition, loopAfterThought) {
        var sourceWithoutNull = _.without(source, null);
        var hasNull = source.length !== sourceWithoutNull.length;

        var dates = _.sortBy(sourceWithoutNull, function(d) {
            return d.getTime();
        });
        // TODO Refactor it, add these info to model, do not calc every time
        var from = dates[0];
        var to = dates[dates.length - 1];

        var transition = new Date();
        transition.setTime(from.getTime());

        var names = [];
        while (true) {
            names.push(this.valueToName(transition));

            if (!loopCondition(transition, to)) {
                break;
            }
            loopAfterThought(transition);
        }

        return this._generateSortedNames(source, names);
    };
    ValueQuery.prototype._generateSortedNames = function(source, names) {
        var sourceWithoutNull = _.without(source, null);
        var hasNull = source.length !== sourceWithoutNull.length;

        if (this._sa.operationGroup.has(OperationType.SORT_DESCEND)) {
            names.reverse();
        }
        if (hasNull) {
            names.push(this.valueToName(null));
        }
        return names;
    };
    ValueQuery.prototype.queryIndex = function(rValues) {
        var value = rValues[this._a.index];
        var name = this.valueToName(value);
        // TODO Performance optimize
        var index = this._names.indexOf(name);

        if (index === -1) {
            throw new Error("Can't find index!");
        }
        return index;
    };
    ValueQuery.prototype.names = function() {
        return this._names;
    };
    ValueQuery.prototype.valueToName = function(value) {
        if (value) {
            return this._valueToName.call(null, value);
        } else {
            return ValueQuery.NULL_NAME;
        }
    }
})();
