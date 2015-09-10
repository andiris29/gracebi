(function($) {
	var grace = andrea.grace;
	var VizIcon = grace.views.vizNavigator.VizIcon;
	var VizIconEvent = grace.views.popUp.VizIconEvent;
	var VizNavigatorEvent = grace.views.popUp.VizNavigatorEvent;
	var VizType = grace.constants.VizType;

	andrea.blink.declare("andrea.grace.views.vizNavigator.VizNavigator");
	var VizNavigator = grace.views.vizNavigator.VizNavigator = function(dom) {
		VizNavigator.superclass.constructor.apply(this, arguments);

		this._$dom = $(this._dom);

		this._selectedType = null;
		this._defaultViewIcon = null;

		var VT = VizType;
		var recommendIcon = VT.manifest(VT.RECOMMEND);
		var groupedIcon = [{
			'title' : '对比',
			'icons' : [VT.manifest(VT.COLUMN), VT.manifest(VT.BAR), VT.manifest(VT.RADAR)]
		}, {
			'title' : '相关性',
			'icons' : [VT.manifest(VT.SCATTER)]
		}, {
			'title' : '趋势',
			'icons' : [VT.manifest(VT.LINE), VT.manifest(VT.AREA)]
		}, {
			'title' : '贡献度',
			'icons' : [VT.manifest(VT.PIE), VT.manifest(VT.STACKED_COLUMN), VT.manifest(VT.STACKED_BAR)]
		}];

		var _this = this;
		this._vizIcons = [];

		var $container = $('<div/>').appendTo(this._$dom).addClass('grace-navigator-contaier');
		// Recommend
		var $recommend = $('<div/>').appendTo($container).addClass('grace-navigator-recommend');
		var $recommendIcon = $('<div/>').appendTo($recommend);
		var viewRecommendIcon = this._defaultViewIcon = new VizIcon($recommendIcon[0], {
			'data' : recommendIcon,
			'basicClass' : 'grace-navigator-recommend-icon',
			'enabledClass' : 'grace-navigator-recommend-icon-enabled',
			'selectedClass' : 'grace-navigator-recommend-icon-selected'
		});
		$('div', viewRecommendIcon.dom()).css('margin-top', '4px');
		this._vizIcons.push(viewRecommendIcon);
		// Selector
		var $selector = $('<div/>').appendTo($container).addClass('grace-navigator-selector');
		var $line;
		$line = $('<div/>').appendTo($selector).addClass('grace-navigator-line');
		this._createGroup($line, groupedIcon[0]);
		this._createGroup($line, groupedIcon[1]);
		$line = $('<div/>').appendTo($container).addClass('grace-navigator-line');
		this._createGroup($line, groupedIcon[2]);
		this._createGroup($line, groupedIcon[3]);
		// Event listener
		var vizIconClickHandler = function(event) {
			_this._select(event.target());
		};
		for (var i = 0; i < this._vizIcons.length; i++) {
			this._vizIcons[i].addEventListener(VizIconEvent.CLICK, vizIconClickHandler);
		}

		viewRecommendIcon.enabled(true);
		this._select(this._defaultViewIcon);
	};
	andrea.blink.extend(VizNavigator, andrea.blink.mvc.View);

	VizNavigator.prototype._createGroup = function($line, group) {
		var _this = this;
		$group = $('<div/>').appendTo($line).addClass('grace-navigator-group');

		var $header = $('<h2/>').appendTo($group).addClass('grace-navigator-group-text');
		$header.text(group.title);
		var $icons = $('<div/>').appendTo($group).addClass('grace-navigator-group-icons');

		for (var i = 0; i < group.icons.length; i++) {
			var icon = group.icons[i];
			var $icon = $('<div/>').appendTo($icons);
			var viewIcon = new VizIcon($icon[0], {
				'data' : icon,
				'basicClass' : 'grace-navigator-group-icon',
				'enabledClass' : 'grace-navigator-group-icon-enabled',
				'selectedClass' : 'grace-navigator-group-icon-selected'
			});

			this._vizIcons.push(viewIcon);
		}
	};
	VizNavigator.prototype.selectedType = function() {
		return this._selectedType;
	}
	VizNavigator.prototype._select = function(targetVizIcon) {
		if (!targetVizIcon.enabled() || targetVizIcon.selected()) {
			return;
		}
		this._selectedType = targetVizIcon.type();

		_.each(this._vizIcons, function(vizIcon) {
			vizIcon.selected(vizIcon === targetVizIcon);
		});
		this.dispatchEvent(new VizNavigatorEvent(VizNavigatorEvent.VIZ_CHANGED, this));
	};
	VizNavigator.prototype.update = function(numDimensions, numMeasures) {
		var _this = this;
		_.each(this._vizIcons, function(vizIcon) {
			var oldSelected = vizIcon.selected();

			vizIcon.update(numDimensions, numMeasures);
			var newEnabled = vizIcon.enabled();
			// if (oldSelected && !newEnabled) {
			// _.defer(function() {
			// _this._select(_this._defaultViewIcon);
			// })
			// }
		});
	};
})(jQuery);
