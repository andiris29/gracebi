(function($) {
    var grace = andrea.grace;

    andrea.blink.declare('andrea.grace.views.popUp.menu.dataProvider.AnalysesProxy');
    var AnalysesProxy = grace.views.popUp.menu.dataProvider.AnalysesProxy = function(analyses) {
        this._analyses = analyses;
    };
    AnalysesProxy.prototype.length = function() {
        return 1;
    };
    AnalysesProxy.prototype.groupLength = function(i) {
        if (i === 0) {
            return this._analyses.length;
        } else {
            return 0;
        }
    };
    AnalysesProxy.prototype.getItem = function(i, j) {
        if (i === 0) {
            return this._analyses[j];
        } else {
            return null;
        }
    };
})(jQuery);
