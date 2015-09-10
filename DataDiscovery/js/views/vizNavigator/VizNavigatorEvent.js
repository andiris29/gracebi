(function() {
    var grace = andrea.grace;
    andrea.blink.declare("andrea.grace.views.popUp.VizNavigatorEvent");

    var VizNavigatorEvent = grace.views.popUp.VizNavigatorEvent = function(type, target, data) {
        VizNavigatorEvent.superclass.constructor.apply(this, arguments);

    };
    andrea.blink.extend(VizNavigatorEvent, andrea.blink.events.Event);

    VizNavigatorEvent.VIZ_CHANGED = "vizChanged";
})();
