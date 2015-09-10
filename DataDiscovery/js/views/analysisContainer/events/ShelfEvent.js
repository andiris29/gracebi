(function() {
    var grace = andrea.grace;
    andrea.blink.declare("andrea.grace.views.analysisContainer.events.ShelfEvent");

    var ShelfEvent = grace.views.analysisContainer.events.ShelfEvent = function(type, target, data) {
        ShelfEvent.superclass.constructor.apply(this, arguments);

    };
    andrea.blink.extend(ShelfEvent, andrea.blink.events.Event);

    ShelfEvent.CARD_COPIED = "cardCopied";
    ShelfEvent.CARD_SHELVED = "cardShelved";

    ShelfEvent.HELPER_DROPPED = "helperDropped";
})();
