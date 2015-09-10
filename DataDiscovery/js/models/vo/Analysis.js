(function($) {

    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.models.vo.Analysis");

    var ShelfType = grace.constants.ShelfType;
    var DataConvertUtil = grace.utils.DataConvertUtil;

    var Analysis = grace.models.vo.Analysis = function() {
        this.id = _.uniqueId("analysisID_");
        this.index = null;
        this.name = null;

        this.dataType = null;

        this.analysisType = null;
        // For dimension
        this.numUniqueValue/*Number*/ = null;
        // For dimension, DATE
        this.dateSpan/*Number*/ = null;
    };
})(jQuery);
