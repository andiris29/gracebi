(function($) {
	var vc = sap.viz.container;

	vc.declare("sap.viz.container.grace.views.ui.ColumnContainerBase");

	var ColumnType = sap.viz.container.grace.constants.ColumnType;
	var GraceAttribute = sap.viz.container.grace.constants.GraceAttribute;
	var ColumnContainerEvent = vc.grace.views.events.ColumnContainerEvent;
	var CalculatorType = vc.grace.calculator.CalculatorType;

	var ColumnContainerBase = vc.grace.views.ui.ColumnContainerBase = function(dom) {
		ColumnContainerBase.superclass.constructor.apply(this, arguments);

		var _this = this;
		/**
		 * @protected
		 */
		this._type = null;

		this._divHeader = document.createElement("div");
		$(this._divHeader).appendTo(dom).addClass("grace-dimensionHeader ui-state-default ui-widget");

		this._divList = document.createElement("div");
		$(this._divList).appendTo(dom).addClass("grace-dimensionContainer");

		this._ul = document.createElement("ul");
		$(this._ul).appendTo(this._divList).addClass("grace-dimensionUL");

		$(this._ul).sortable({
			connectWith : ".grace-dimensionUL"
		}).on("sortreceive sortremove", function(event, ui) {
			var lis = $(_this._ul).children("li");
			var columnMetadatas = [];
			for (var i = 0; i < lis.length; i++) {
				columnMetadatas.push({
					"id" : $(lis[i]).attr(GraceAttribute.COLUMN_ID),
					"calculatorType" : $(lis[i]).attr(GraceAttribute.COLUMN_CALCULATOR_TYPE)
				});
			}

			_this.dispatchEvent(new ColumnContainerEvent(ColumnContainerEvent.COLUMN_CHANGED, this, {
				type : _this._type,
				columnMetadatas : columnMetadatas
			}));
		});
	};
	sap.viz.container.extend(ColumnContainerBase, vc.common.mvc.View);

	ColumnContainerBase.prototype.ul = function() {
		return this._ul;
	}
	/**
	 * @protected
	 */
	ColumnContainerBase.prototype.appendColumn = function(id, name, type) {
		if (type === ColumnType.MEASURE) {
			// TODO Remove these demo flags
			if (id.indexOf("sum_") === 0) {
				this._appendColumn(id, name, type, CalculatorType.SUM);
			} else if (id.indexOf("avg_") === 0) {
				this._appendColumn(id, name, type, CalculatorType.AVG);
			} else {
				this._appendColumn(id, name, type, CalculatorType.SUM);
				// this._appendColumn(id, name, type, CalculatorType.MAX);
			}
		} else if (type === ColumnType.DIMENSION) {
			this._appendColumn(id, name, type);
		}
	}
	ColumnContainerBase.prototype._appendColumn = function(id, name, type, calculatorType) {

		var li = document.createElement("li");
		$(li).appendTo(this._ul).addClass("ui-state-default ui-corner-all grace-dimensionLI").attr(GraceAttribute.COLUMN_ID, id);
		if (calculatorType) {
			$(li).attr(GraceAttribute.COLUMN_CALCULATOR_TYPE, calculatorType);
		}

		var a = document.createElement("a");
		$(a).appendTo(li).addClass("ui-button ui-widget ui-button-text-icon-primary").attr({
			"role" : "button",
			"aria-disabled" : "false"
		});

		var spanIcon = document.createElement("span");
		$(spanIcon).appendTo(a).addClass("ui-button-icon-primary ui-icon").addClass(ColumnType.getDetails(type).iconClass);
		var spanText = document.createElement("span");
		$(spanText).appendTo(a).addClass("ui-button-text").text(CalculatorType.format(name, calculatorType));
	}

	ColumnContainerBase.prototype.removeAll = function() {
		$(this._ul).empty();
	}
})(jQuery);
