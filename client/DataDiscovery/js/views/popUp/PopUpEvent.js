(function() {
	var grace = andrea.grace;
	andrea.blink.declare("andrea.grace.views.popUp.PopUpEvent");

	var PopUpEvent = grace.views.popUp.PopUpEvent = function(type, target, data) {
		PopUpEvent.superclass.constructor.apply(this, arguments);

	};
	andrea.blink.extend(PopUpEvent, andrea.blink.events.Event);

	PopUpEvent.POPUP_OPENED = "popupOpened";
	PopUpEvent.POPUP_CLOSED = "popupClosed";
})();
