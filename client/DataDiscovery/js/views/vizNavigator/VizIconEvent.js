(function() {
    var grace = andrea.grace;
    andrea.blink.declare("andrea.grace.views.popUp.VizIconEvent");

    var VizIconEvent = grace.views.popUp.VizIconEvent = function(type, target, data) {
        VizIconEvent.superclass.constructor.apply(this, arguments);

    };
    andrea.blink.extend(VizIconEvent, andrea.blink.events.Event);

    VizIconEvent.CLICK = "click";
})();
