(function() {
	var grace = andrea.grace;
	andrea.blink.declare("andrea.grace.views.popUp.menu.MenuEvent");

	var MenuEvent = grace.views.popUp.menu.MenuEvent = function(type, target, data) {
		MenuEvent.superclass.constructor.apply(this, arguments);

	};
	andrea.blink.extend(MenuEvent, andrea.blink.events.Event);

	MenuEvent.ITEM_SELECTED = "itemSelected";
})();
