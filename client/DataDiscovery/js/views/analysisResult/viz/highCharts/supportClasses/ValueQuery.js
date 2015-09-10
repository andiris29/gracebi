(function() {
    var grace = andrea.grace;

    var ValueType = grace.constants.ValueType;
    var OperationType = grace.operation.OperationType;
    var NullValue = grace.models.value.NullValue;
    var DateValue = grace.models.value.DateValue;

    andrea.blink.declare("andrea.grace.views.analysisResult.viz.highCharts.supportClasses.ValueQuery");
    var ValueQuery = andrea.grace.views.analysisResult.viz.highCharts.supportClasses.ValueQuery = function(dataProvider, shelvedAnalysis, turboThreshold) {
        this._dataProvider = dataProvider;
        this._sa = shelvedAnalysis;
        this._a = this._sa.source;

        this._names = null;
        this._captionParams = [];

        this._initialize();

        // Highcharts limitation
        this._allNames = this._names;
        this._names = this._names.slice(0, turboThreshold);
    };
    ValueQuery.prototype._initialize = function() {
        var values = this._dataProvider.getCValues(this._a.index, true, true);

        // Builde names
        var source = {
            'values' : values,
            'hasNull' : this._dataProvider.isCHasNull(this._a.index)
        };
        if (this._a.valueType() === ValueType.STRING) {
            this._names = this._generateNames(source);
        } else if (this._a.valueType() === ValueType.NUMBER) {
            this._names = this._generateNames(source);
        } else if (this._a.valueType() === ValueType.DATE) {
            // Drill
            if (this._sa.operationGroup.has(OperationType.DRILL_YEAR)) {
                // Year
                this._captionParams = [DateValue.CAPTION_DRILL_YEAR];
                this._names = this._generateDateDrillNames(source, function(transition) {
                    transition.setMonth(0);
                    transition.setDate(1);
                }, function(transition, to) {
                    return transition.getFullYear() < to.getFullYear();
                }, function(transition) {
                    transition.setFullYear(transition.getFullYear() + 1);
                });
            } else if (this._sa.operationGroup.has(OperationType.DRILL_MONTH)) {
                // Month
                this._captionParams = [DateValue.CAPTION_DRILL_MONTH];
                this._names = this._generateDateDrillNames(source, function(transition) {
                    transition.setDate(1);
                }, function(transition, to) {
                    return transition.getFullYear() * 12 + transition.getMonth() < to.getFullYear() * 12 + to.getMonth();
                }, function(transition) {
                    transition.setMonth(transition.getMonth() + 1);
                });
            } else if (this._sa.operationGroup.has(OperationType.DRILL_WEEK)) {
                // Week
                this._captionParams = [DateValue.CAPTION_DRILL_WEEK];
                this._names = this._generateDateDrillNames(source, function(transition) {
                }, function(transition, to) {
                    return Math.floor(transition.getMonsday().getTime() / 7 / 24 / 3600 / 1000) < Math.floor(to.getMonsday().getTime() / 7 / 24 / 3600 / 1000)
                }, function(transition) {
                    transition.setDate(transition.getDate() + 7);
                });
            } else if (this._sa.operationGroup.has(OperationType.DRILL_DATE)) {
                // Date
                this._captionParams = [DateValue.CAPTION_DRILL_DATE];
                // this._valueToName = ValueToName.dateDrillDate;
                this._names = this._generateDateDrillNames(source, function(transition) {
                }, function(transition, to) {
                    return Math.floor(transition.getTime() / 24 / 3600 / 1000) < Math.floor(to.getTime() / 24 / 3600 / 1000)
                }, function(transition) {
                    transition.setDate(transition.getDate() + 1);
                });
            }
            // Group
            else if (this._sa.operationGroup.has(OperationType.GROUP_MONTH)) {
                this._captionParams = [DateValue.CAPTION_GROUP_MONTH];
                this._names = this._generateSortedNames(source, _.clone(Date.monthNames));
            } else if (this._sa.operationGroup.has(OperationType.GROUP_DATE)) {
                this._captionParams = [DateValue.CAPTION_GROUP_DATE];
                this._names = this._generateSortedNames(source, _.clone(Date.dateNames));
            } else if (this._sa.operationGroup.has(OperationType.GROUP_DAY)) {
                this._captionParams = [DateValue.CAPTION_GROUP_DAY];
                this._names = this._generateSortedNames(source, _.clone(Date.dayNames));
            } else if (this._sa.operationGroup.has(OperationType.GROUP_HOUR)) {
                this._captionParams = [DateValue.CAPTION_GROUP_HOUR];
                this._names = this._generateSortedNames(source, _.clone(Date.hourNames));
            }
        }
    }

    ValueQuery.prototype._generateNames = function(source) {
        var values = source.values;
        var v;
        // TODO Performance optimize
        if (this._sa.operationGroup.ascend()) {
            values = _.sortBy(values, function(v) {
                v.caption.apply(v, this._captionParams);
            });
        } else if (this._sa.operationGroup.descend()) {
            values = _.sortBy(values, function(v) {
                v.caption.apply(v, this._captionParams);
            });
            values.reverse();
        }

        var names = [];
        _.each(values, function(v) {
            names.push(v.caption.apply(v, this._captionParams))
        });
        if (source.hasNull) {
            v = NullValue.instance();
            names.push(v.caption.apply(v, this._captionParams));
        }
        return names;
    };
    ValueQuery.prototype._generateDateDrillNames = function(source, loopInitialization, loopCondition, loopAfterThought) {
        var values = source.values;

        var dates = _.sortBy(values, function(d) {
            return d.quantified();
        });
        if (dates.length === 0) {
            return [];
        }

        var from = dates[0];
        var to = dates[dates.length - 1];

        var transition = new Date();
        transition.setTime(from.value().getTime());

        loopInitialization(transition);
        var names = [];
        while (true) {
            var v = new DateValue('', transition);
            names.push(v.caption.apply(v, this._captionParams));

            if (!loopCondition(transition, to.value())) {
                break;
            }
            loopAfterThought(transition);
        }

        return this._generateSortedNames(source, names);
    };
    ValueQuery.prototype._generateSortedNames = function(source, names) {
        if (this._sa.operationGroup.has(OperationType.SORT_DESCEND)) {
            names.reverse();
        }
        if (source.hasNull) {
            var v = NullValue.instance();
            names.push(v.caption.apply(v, this._captionParams));
        }
        return names;
    };
    ValueQuery.prototype.queryIndex = function(rValues) {
        var v = rValues[this._a.index];
        var name = v.caption.apply(v, this._captionParams);
        // TODO Performance optimize
        var index = this._names.indexOf(name);

        if (index === -1 && this._allNames.indexOf(name) === -1) {
        }
        return index;
    };
    ValueQuery.prototype.names = function() {
        return this._names;
    };
})();
