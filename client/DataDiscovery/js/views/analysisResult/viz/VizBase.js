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
     * @param {Object} dimesionSAs
     * @param {Object} dataSAs
     *
     */
    VizBase.prototype.render = function(dataProvider, dimesionSAs, dataSAs) {
        VizBase._renderingCache = null;
        return true;
    };
    VizBase._renderingCache = null;
    VizBase.prototype.toJSON = function() {
        return null;
    };
    VizBase.prototype._addMessage = function(msgID) {
        // TODO
    };
    VizBase.prototype._removeMessages = function(msgID) {

    };
    VizBase._MESSAGES = {
    };
})(jQuery);
