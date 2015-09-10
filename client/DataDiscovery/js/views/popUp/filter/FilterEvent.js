(function() {
	var grace = andrea.grace;
	andrea.blink.declare("andrea.grace.views.popUp.filter.FilterEvent");

	var FilterEvent = grace.views.popUp.filter.FilterEvent = function(type, target, data) {
		FilterEvent.superclass.constructor.apply(this, arguments);

	};
	andrea.blink.extend(FilterEvent, andrea.blink.events.Event);

	FilterEvent.ITEM_SELECTED = "itemSelected";
})();
