(function($) {
	var grace = andrea.grace;

	andrea.blink.declare("andrea.grace.managers.PopUpManager");

	var PopUpManager = grace.managers.PopUpManager;

	PopUpManager.createPopUp = function(popUp) {
		var $popUp = $(popUp.dom())
		$popUp.appendTo($("body"));
		return popUp;
	}
	PopUpManager.removePopUp = function(popUp) {
		var $popUp = $(popUp.dom())
		$popUp.detach();
	}
})(jQuery);
