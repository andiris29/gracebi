/**
 * Dependencies
 * 	JavascriptToolbox-Date 1.02
 * 		http://www.JavascriptToolbox.com/lib/date/
 *
 */
(function() {
	// TODO Globalization
	// Override
	Date.monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
	Date.dateNames = (function() {
		var array = _.range(1, 31 + 1);
		_.each(array, function(element, index, array) {
			array[index] = element + "日"
		});
		return array;
	})();
	// Override
	Date.dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
	Date.hourNames = (function() {
		var array = _.range(0, 24);
		_.each(array, function(element, index, array) {
			array[index] = element + "时"
		});
		return array;
	})();

	Date.prototype.getMonsday = function() {
		var t = new Date();
		t.setTime(this.getTime());
		t.clearTime();
		t.setDate(t.getDate() - (t.getDay() === 0 ? 6 : t.getDay() - 1));
		return t;
	};

})();
