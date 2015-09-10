(function() {
	var grace = andrea.grace;

	andrea.blink.declare("andrea.grace.views.analysisResult.viz.highCharts.supportClasses.ValueToName");
	var ValueToName = andrea.grace.views.analysisResult.viz.highCharts.supportClasses.ValueToName;

	ValueToName.string = function(value) {
		return value;
	};
	ValueToName.number = function(value) {
		return value;
	};
	ValueToName.dateDrillYear = function(value) {
		return value.format('yyyy');
	};
	ValueToName.dateDrillMonth = function(value) {
		return value.format('yyyy/M');
	};
	ValueToName.dateDrillWeek = function(value) {
		var from = value.getMonsday();
		var to = new Date();
		to.setTime(from.getTime() + 7 * 24 * 3600 * 1000);
		return from.format('yyyy/M/d') + '-' + to.format('M/d');
	};
	ValueToName.dateDrillDate = function(value) {
		return value.format('yyyy/M/d');
	};
	ValueToName.dateGroupMonth = function(value) {
		return Date.monthNames[value.getMonth()];
	};
	ValueToName.dateGroupDate = function(value) {
		return Date.dateNames[value.getDate() - 1];
	};
	ValueToName.dateGroupDay = function(value) {
		return Date.dayNames[value.getDay()];
	};
	ValueToName.dateGroupHour = function(value) {
		return Date.hourNames[value.getHours()];
	};
})();
