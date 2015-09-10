(function($) {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.views.analysisResult.viz.VizBase");

    var VizBase = grace.views.analysisResult.viz.VizBase = function(dom) {
        VizBase.superclass.constructor.apply(this, arguments);

        this._$dom = $(dom);
        this._$dom.addClass('grace-result-viz');
    };
    andrea.blink.extend(VizBase, andrea.blink.mvc.View);

    /**
     * Should be overrided by child class
     *
     * @param {Object} dataProvider
     * @param {Object} dimesions
     * @param {Object} datas
     *
     */
    VizBase.prototype.render = function(dataProvider, dimesions, datas) {
    };
    VizBase.prototype._addMessage = function(msgID) {
        // TODO
    };
    VizBase.prototype._removeMessages = function(msgID) {

    };
    VizBase._MESSAGES = {
    };
})(jQuery);
