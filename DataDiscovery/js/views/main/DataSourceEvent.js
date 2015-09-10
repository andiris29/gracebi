(function() {
    var grace = andrea.grace;
    andrea.blink.declare("andrea.grace.views.analysisContainer.events.DataSourceEvent");

    var DataSourceEvent = grace.views.analysisContainer.events.DataSourceEvent = function(type, target, data) {
        DataSourceEvent.superclass.constructor.apply(this, arguments);
    };
    andrea.blink.extend(DataSourceEvent, andrea.blink.events.Event);

    DataSourceEvent.DATA_SOURCE_READY = "dataSourceReady";
})();
