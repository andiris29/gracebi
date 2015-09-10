(function($) {
    var grace = andrea.grace;
    var Operation = grace.operation.Operation;
    var OperationPriorityBaseline = grace.operation.OperationPriorityBaseline;

    andrea.blink.declare("andrea.grace.operation.OperationFactory");
    var OperationFactory = grace.operation.OperationFactory;

    if (!OperationFactory._count) {
        OperationFactory._count = 0;
    }
    if (!OperationFactory._mapping) {
        OperationFactory._mapping = {};
    }
    OperationFactory.produce = function(type, baseline) {
        var o = new Operation(type, baseline + OperationFactory._count);

        OperationFactory._count++;
        OperationFactory._mapping[o.id] = o;

        return o;
    };
    OperationFactory.get = function(id) {
        return OperationFactory._mapping[id];
    };
    OperationFactory.register = function(o) {
        if (!OperationFactory._mapping[o.id]) {
            OperationFactory._count++;
            OperationFactory._mapping[o.id] = o;
        }
    };
})(jQuery);
