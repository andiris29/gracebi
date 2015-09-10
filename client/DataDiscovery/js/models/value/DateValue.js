(function() {

	var grace = andrea.grace;

	andrea.blink.declare("andrea.grace.models.value.DateValue");
	var DateValue = grace.models.value.DateValue = function(raw, value) {
		DateValue.superclass.constructor.apply(this, arguments);

		this._captionsByFormat = {};

		DateValue._instances[raw] = this;
	};
	andrea.blink.extend(DateValue, andrea.grace.models.value.ValueBase);

	DateValue._instances = {};
	DateValue.instance = function(raw) {
		return DateValue._instances[raw];
	};

	DateValue.prototype.quantified = function() {
		if (this._quantified === null) {
			this._quantified = this._value.getTime();
		}
		return this._quantified;
	};
	DateValue.CAPTION_DRILL_YEAR = 'CAPTION_DRILL_YEAR';
	DateValue.CAPTION_DRILL_MONTH = 'CAPTION_DRILL_MONTH';
	DateValue.CAPTION_DRILL_WEEK = 'CAPTION_DRILL_WEEK';
	DateValue.CAPTION_DRILL_DATE = 'CAPTION_DRILL_DATE';
	DateValue.CAPTION_GROUP_MONTH = 'CAPTION_GROUP_MONTH';
	DateValue.CAPTION_GROUP_DATE = 'CAPTION_GROUP_DATE';
	DateValue.CAPTION_GROUP_DAY = 'CAPTION_GROUP_DAY';
	DateValue.CAPTION_GROUP_HOUR = 'CAPTION_GROUP_HOUR';

	DateValue.prototype.caption = function(format) {
		if (!format) {
			format = DateValue.CAPTION_DRILL_DATE;
		}
		var caption;
		if (!this._captionsByFormat[format]) {
			if (format === DateValue.CAPTION_DRILL_YEAR) {
				caption = this._value.format('yyyy');
			} else if (format === DateValue.CAPTION_DRILL_MONTH) {
				caption = this._value.format('yyyy/M');
			} else if (format === DateValue.CAPTION_DRILL_DATE) {
				caption = this._value.format('yyyy/M/d');
			} else if (format === DateValue.CAPTION_DRILL_WEEK) {
				var from = this._value.getMonsday();
				var to = new Date();
				to.setTime(from.getTime() + 7 * 24 * 3600 * 1000);
				caption = from.format('yyyy/M/d') + '-' + to.format('M/d');
			} else if (format === DateValue.CAPTION_GROUP_MONTH) {
				caption = Date.monthNames[this._value.getMonth()];
			} else if (format === DateValue.CAPTION_GROUP_DATE) {
				caption = Date.dateNames[this._value.getDate() - 1];
			} else if (format === DateValue.CAPTION_GROUP_DAY) {
				caption = Date.dayNames[this._value.getDay()];
			} else if (format === DateValue.CAPTION_GROUP_HOUR) {
				caption = Date.hourNames[this._value.getHours()];
			}

			this._captionsByFormat[format] = caption;
		}
		return this._captionsByFormat[format];
	};
})();
