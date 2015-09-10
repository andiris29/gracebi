/**
 * Dependencies
 * 	jquery-1.8.3
 *
 */
(function($) {
	$.fn.appendAt = function(element, index) {
		var children = this.children();
		if (index < 0) {
			if (children.length > 0) {
				$(children[0]).before(element);
			} else {
				this.append(element);
			}
		} else {
			if (index < children.length) {
				$(children[index]).before(element);
			} else {
				this.append(element);
			}
		}
	};
})(jQuery);
