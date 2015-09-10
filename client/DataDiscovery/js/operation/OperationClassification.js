(function() {
	var grace = andrea.grace;

	andrea.blink.declare("andrea.grace.operation.OperationClassification");

	var OperationClassification = grace.operation.OperationClassification;

    OperationClassification.CARD_OPERATION = "cardOperation";
    OperationClassification.CALCULATE = "calculate";
	OperationClassification.SORT = "sort";
	OperationClassification.DRILL = "drill"
	OperationClassification.GROUP = "group";

	OperationClassification.exclusive = function(c1, c2) {
		if (c1 === c2) {
			return true;
		} else if ((c1 === OperationClassification.DRILL || c1 === OperationClassification.GROUP) && (c2 === OperationClassification.DRILL || c2 === OperationClassification.GROUP)) {
			return true;
		} else {
			return false;
		}
	}
})();
