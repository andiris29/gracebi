(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.utils.SerializeUtil");
    var SerializeUtil = grace.utils.SerializeUtil;

    SerializeUtil.batchToJSON = function(instances, toJSON) {
        if (_.isArray(instances)) {
            var result = [];
            for (var i = 0; i < instances.length; i++) {
                result.push(toJSON.call(null, instances[i]));
            }
            return result;
        } else if (instances) {
            return toJSON.call(null, instances);
        } else {
            return null;
        }
    };

    SerializeUtil.batchFromJSON = function(array, fromJSON) {
        if (_.isArray(array)) {
            var result = [];
            for (var i = 0; i < array.length; i++) {
                result.push(fromJSON.call(null, array[i]));
            }
            return result;
        } else if (array) {
            return fromJSON.call(null, array);
        } else {
            return null;
        }
    };
})();
