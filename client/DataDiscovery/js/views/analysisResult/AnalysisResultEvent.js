(function() {
    var grace = andrea.grace;
    andrea.blink.declare("grace.views.analysisResult.AnalysisResultEvent");

    var AnalysisResultEvent = grace.views.analysisResult.AnalysisResultEvent = function(type, target, data) {
        AnalysisResultEvent.superclass.constructor.apply(this, arguments);
    };
    andrea.blink.extend(AnalysisResultEvent, andrea.blink.events.Event);

    AnalysisResultEvent.SAVE = "save";
})();
