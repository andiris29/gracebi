(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.utils.FilterUtil");
    var FilterUtil = grace.utils.FilterUtil;

    FilterUtil.filter = function(dataProvider, filterSAs) {
        if (!filterSAs || filterSAs.length === 0) {
            return dataProvider;
        }
        var filteredValues2d = [];
        for ( i = 0; i < dataProvider.numRows; i++) {
            var values = dataProvider.getRValues(i);
            // Filter
            var filtered = true;
            _.each(filterSAs, function(sa) {
                filtered = filtered && sa.filter.filter(values[sa.source.index]);
            });
            if (!filtered) {
                continue;
            }
            filteredValues2d.push(values);
        }
        return new grace.models.DataProvider(filteredValues2d);
    }
})();
