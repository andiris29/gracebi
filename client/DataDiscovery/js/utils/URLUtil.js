(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.utils.URLUtil");
    var URLUtil = grace.utils.URLUtil;

    var _hashPairs = null;

    URLUtil.hashPairs = function() {
        if (_hashPairs === null) {
            _hashPairs = {};
            // Ignore '#' in the hash
            var paramString = window.location.hash.slice(1);
            var parameters = paramString.split("&");
            for (var index in parameters) {
                var parameter = parameters[index].split("=");
                if (parameter.length == 2) {
                    var name = parameter[0];
                    if (name) {
                        _hashPairs[name] = decodeURIComponent(parameter[1]);
                    }
                }
            }

            paramString = window.location.search.slice(1);
            // Ignore '?' in the search
            parameters = paramString.split("&");
            for (var index in parameters) {
                var parameter = parameters[index].split("=");
                if (parameter.length == 2) {
                    var name = parameter[0];
                    if (name && (_hashPairs[name] == null || _hashPairs[name] === "")) {
                        _hashPairs[name] = decodeURIComponent(parameter[1]);
                    }
                }
            }
        }
        return _hashPairs;
    };
})();
