(function() {
	var grace = andrea.grace;

	andrea.blink.declare("andrea.grace.operation.OperationPriorityBaseline");

	var OperationPriorityBaseline = grace.operation.OperationPriorityBaseline;

	OperationPriorityBaseline.DISPLAY_ONLY = 0;
	OperationPriorityBaseline.DEFAULT_OPERATION = 10000;
	OperationPriorityBaseline.USER_SPECIFICATION = 20000;

})();
