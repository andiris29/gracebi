(function($) {
	var grace = andrea.grace;
	andrea.blink.declare("andrea.grace.operation.OperationType");

	var OperationType = grace.operation.OperationType;

    OperationType.CARD_REMOVE = "CARD_REMOVE";
    OperationType.CARD_ADD_TO_DIMENSION = "CARD_ADD_TO_DIMENSION";
    OperationType.CARD_ADD_TO_MEASURE = "CARD_ADD_TO_MEASURE";
    
	OperationType.CALC_COUNT = "CALC_COUNT";
	OperationType.CALC_UNIQ_COUNT = "CALC_UNIQ_COUNT";
	OperationType.CALC_SUM = "CALC_SUM";
	OperationType.CALC_AVG = "CALC_AVG";
	OperationType.CALC_MAX = "CALC_MAX";
	OperationType.CALC_MIN = "CALC_MIN";

	OperationType.SORT_NONE = "SORT_NONE";
	OperationType.SORT_ASCEND = "SORT_ASCEND";
	OperationType.SORT_DESCEND = "SORT_DESCEND";
    OperationType.SORT_ALPHABET_ASCEND = "SORT_ALPHABET_ASCEND";
    OperationType.SORT_ALPHABET_DESCEND = "SORT_ALPHABET_DESCEND";

	OperationType.DRILL_YEAR = "DRILL_YEAR";
	OperationType.DRILL_MONTH = "DRILL_MONTH";
	OperationType.DRILL_WEEK = "DRILL_WEEK";
	OperationType.DRILL_DATE = "DRILL_DATE";
	// OperationType.DRILL_HOUR = "DRILL_HOUR";

	OperationType.GROUP_MONTH = "GROUP_MONTH";
	OperationType.GROUP_DATE = "GROUP_DATE";
	OperationType.GROUP_DAY = "GROUP_DAY";
	OperationType.GROUP_HOUR = "GROUP_HOUR";
})(jQuery);
