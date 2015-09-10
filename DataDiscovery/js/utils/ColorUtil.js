(function() {
	var grace = andrea.grace;

	andrea.blink.declare("andrea.grace.utils.ColorUtil");

	var ColorUtil = grace.utils.ColorUtil;

	ColorUtil.hexToRgb = function(hex) {
		// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
		var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, function(m, r, g, b) {
			return r + r + g + g + b + b;
		});

		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r : parseInt(result[1], 16),
			g : parseInt(result[2], 16),
			b : parseInt(result[3], 16)
		} : null;
	}

	ColorUtil.rgbToHex = function(r, g, b) {
		return "#" + ColorUtil._componentToHex(r) + ColorUtil._componentToHex(g) + ColorUtil._componentToHex(b);
	}
	ColorUtil._componentToHex = function(c) {
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	}
})();