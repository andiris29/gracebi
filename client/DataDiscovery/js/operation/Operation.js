(function($) {
    var grace = andrea.grace;

    var OperationClassification = grace.operation.OperationClassification;
    var OperationType = grace.operation.OperationType;

    andrea.blink.declare('andrea.grace.operation.Operation');
    var Operation = grace.operation.Operation = function(type, priority) {
        this.id = _.uniqueId('operationID_');
        this.type = type;
        this.priority = priority;

        this.name = Operation._TYPE_TO_NAME[this.type];
        this.abbreviation = Operation._TYPE_TO_ABBREVIATION[this.type];
        this.classification = Operation._TYPE_TO_CLASSIFICATION[this.type];

        this.classificationName = Operation._CLASSIFICATION_TO_NAME[this.classification];
    };

    Operation._TYPE_TO_NAME = {};
    Operation._TYPE_TO_ABBREVIATION = {};
    Operation._TYPE_TO_CLASSIFICATION = {};

    Operation._CLASSIFICATION_TO_TYPES = {};
    Operation._CLASSIFICATION_TO_NAME = {};

    Operation._loadClass = function() {
        var loadType = function(classification, type, name, abbreviation) {
            Operation._TYPE_TO_CLASSIFICATION[type] = classification;
            Operation._TYPE_TO_NAME[type] = name;
            Operation._TYPE_TO_ABBREVIATION[type] = abbreviation;

            if (!Operation._CLASSIFICATION_TO_TYPES[classification]) {
                Operation._CLASSIFICATION_TO_TYPES[classification] = [];
            }
            Operation._CLASSIFICATION_TO_TYPES[classification].push(type);
        };
        var loadClassification = function(classification, name) {
            Operation._CLASSIFICATION_TO_NAME[classification] = name;
        };
        // Classification
        loadClassification(OperationClassification.CARD_OPERATION, '删除');
        loadClassification(OperationClassification.CALCULATE, '计算');
        loadClassification(OperationClassification.SORT, '排序');
        loadClassification(OperationClassification.DRILL, '每');
        loadClassification(OperationClassification.GROUP, '按...分组');
        // CARD_OPERATION
        loadType(OperationClassification.CARD_OPERATION, OperationType.CARD_ADD_TO_DIMENSION, '\uf067 分析纬度', '');
        loadType(OperationClassification.CARD_OPERATION, OperationType.CARD_ADD_TO_MEASURE, '\uf067 分析指标', '');
        loadType(OperationClassification.CARD_OPERATION, OperationType.CARD_REMOVE, '\uf00d 移除', '');
        // CALCULATE
        loadType(OperationClassification.CALCULATE, OperationType.CALC_COUNT, '总数', '总');
        loadType(OperationClassification.CALCULATE, OperationType.CALC_UNIQ_COUNT, '计数（唯一）', '数');
        loadType(OperationClassification.CALCULATE, OperationType.CALC_SUM, '∑ 总和', '∑');
        loadType(OperationClassification.CALCULATE, OperationType.CALC_AVG, '平均值', '均');
        loadType(OperationClassification.CALCULATE, OperationType.CALC_MAX, '最大值', 'Max');
        loadType(OperationClassification.CALCULATE, OperationType.CALC_MIN, '最小值', 'Min');
        // SORT
        loadType(OperationClassification.SORT, OperationType.SORT_NONE, '不排序', '');
        loadType(OperationClassification.SORT, OperationType.SORT_ASCEND, '\uf160 升序', '\uf160');
        loadType(OperationClassification.SORT, OperationType.SORT_DESCEND, '\uf161 降序', '\uf161');
        loadType(OperationClassification.SORT, OperationType.SORT_ALPHABET_ASCEND, '\uf15d 升序', '\uf15d');
        loadType(OperationClassification.SORT, OperationType.SORT_ALPHABET_DESCEND, '\uf15e 降序', '\uf15e');
        // DRILL
        var today = new Date();
        loadType(OperationClassification.DRILL, OperationType.DRILL_YEAR, '每年 (' + today.format('yyyy') + ')', '每年');
        loadType(OperationClassification.DRILL, OperationType.DRILL_MONTH, '每月 (' + today.format('yyyy/M') + ')', '每月');
        var currentMon = today.getMonsday();
        var nextMon = new Date();
        nextMon.setTime(currentMon.getTime() + 7 * 24 * 3600 * 1000);
        loadType(OperationClassification.DRILL, OperationType.DRILL_WEEK, '每周 (' + currentMon.format('yyyy/M/d') + ' - ' + nextMon.format('M/d') + ')', '每周');
        loadType(OperationClassification.DRILL, OperationType.DRILL_DATE, '每日 (' + today.format('yyyy/M/d') + ')', '每日');
        // GROUP
        loadType(OperationClassification.GROUP, OperationType.GROUP_MONTH, '分月 (1-12)', '月');
        loadType(OperationClassification.GROUP, OperationType.GROUP_DATE, '分日 (1-31)', '日');
        loadType(OperationClassification.GROUP, OperationType.GROUP_DAY, '分星期 (1-7)', '星');
        loadType(OperationClassification.GROUP, OperationType.GROUP_HOUR, '分时 (0-23)', '时');
    };
    Operation._loadClass();

    Operation.getTypes = function(classification) {
        return Operation._CLASSIFICATION_TO_TYPES[classification];
    };

    Operation.toJSON = function(instance) {
        return {
            'id' : instance.id,
            'type' : instance.type,
            'priority' : instance.priority,
            'name' : instance.name,
            'abbreviation' : instance.abbreviation,
            'classification' : instance.classification,
            'classificationName' : instance.classificationName
        };
    };
    Operation.fromJSON = function(json) {
        var instance = new Operation();
        instance.id = json.id;
        instance.type = json.type;
        instance.priority = json.priority;
        instance.name = json.name;
        instance.abbreviation = json.abbreviation;
        instance.classification = json.classification;
        instance.classificationName = json.classificationName;
        grace.operation.OperationFactory.register(instance);
        return instance;
    };
})(jQuery);
