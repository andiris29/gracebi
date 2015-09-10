(function($) {
	var vc = sap.viz.container;

	vc.declare("sap.viz.container.grace.views.ui.VizContainer");

	var VizContainer = vc.grace.views.ui.VizContainer = function(dom) {
		VizContainer.superclass.constructor.apply(this, arguments);

		var uiConfig = $.extend({}, vc.constants.UIConfig.DEFAULT);
		uiConfig.enableMorphing = true;
		uiConfig.modules[2].visible = false;
		uiConfig.modules.pop();

		this._recreateViz();
	};
	sap.viz.container.extend(VizContainer, vc.common.mvc.View);

	VizContainer.prototype.removeAll = function(options) {
		// TODO Destory
		// this._recreateViz();
	}
	VizContainer.prototype.changeViz = function(options) {
		// TODO find the prefered viz type
		// this._recreateViz();

		options.properties = VizContainer.DEFAULT_PROPERTIES;
		this._sapVizContainer.changeViz(options);
	};
	VizContainer.prototype._recreateViz = function() {
		$(this._dom).empty();

		this._sapVizContainer = sap.viz.container.createVizContainer(this._dom, VizContainer.DEFAULT_UI_CONFIG);
		this._sapVizContainer.size({
			width : $(document).width() - 380,
			height : $(document).height() - 6
		});
	}

	VizContainer.DEFAULT_UI_CONFIG = {
		"defaultVizType" : "viz/column",
		"modules" : [{
			// We will assign "id" internally for these build-in modules
			// We may add "layout" for feature enhancement
			// We may add "modules" for container
			"type" : "vizContainer/VizSwitchBar",
			"visible" : true,
			"types" : {
				"groups" : [{
					"types" : [{
						"id" : "viz/column"
					}, {
						"id" : "viz/stacked_column"
					}, {
						"id" : "viz/dual_column"
					}, {
						"id" : "viz/3d_column",
						"enabled" : true
					}]
				}, {
					"types" : [{
						"id" : "viz/line"
					}, {
						"id" : "viz/area"
						// }, {
						// "id" : "viz/combination"
					}, {
						"id" : "viz/dual_line"
					}, {
						"id" : "viz/dual_combination"
					}]
				}, {
					"types" : [{
						"id" : "viz/pie"
					}, {
						"id" : "viz/donut"
						// }, {
						// "id" : "viz/pie_with_depth"
					}]
					// }, {
					// "types" : [{
					// "id" : "viz/geobubble"
					// }, {
					// "id" : "viz/choropleth"
					// }, {
					// "id" : "viz/geopie"
					// }]
				}, {
					"types" : [{
						"id" : "viz/scatter"
					}, {
						"id" : "viz/bubble"
						// }, {
						// "id" : "viz/scatter_matrix"
					}]
				}, {
					"types" : [{
						"id" : "viz/heatmap"
					}, {
						"id" : "viz/treemap"
					}, {
						"id" : "viz/tagcloud"
					}, {
						"id" : "viz/radar"					}]
					// }, {
					// "types" : [{
					// "id" : "viz/table"
					// }]
					// }, {
					// "types" : [{
					// "id" : "viz/radar"
					// }, {
					// // "id" : "viz/boxplot"
					// // }, {
					// // "id" : "viz/waterfall"
					// // }, {
					// "id" : "viz/tagcloud"
					// }]
				}]
			}
		}, {
			"type" : "vizContainer/Setting",
			"visible" : true,
			"menu" : {
				"viz/column" : ["legend", "direction", "datalabels"],
				"viz/stacked_column" : ["legend", "direction", "stacking", "datalabels"],
				"viz/dual_column" : ["legend", "direction", "datalabels"],
				"viz/3d_column" : ["legend", "direction", "datalabels"],
				"viz/line" : ["legend", "direction", "datalabels"],
				"viz/area" : ["legend", "direction", "stacking", "datalabels"],
				"viz/combination" : ["legend", "direction", "datalabels"],
				"viz/dual_line" : ["legend", "direction", "datalabels"],
				"viz/dual_combination" : ["legend", "direction", "datalabels"],
				"viz/pie" : ["legend", "datalabels"],
				"viz/donut" : ["legend", "datalabels"],
				"viz/pie_with_depth" : ["legend", "datalabels"],
				"viz/geobubble" : ["legend", "datalabels"],
				"viz/choropleth" : ["legend", "datalabels"],
				"viz/geopie" : ["legend", "datalabels"],
				"viz/scatter" : ["legend", "datalabels"],
				"viz/bubble" : ["legend", "datalabels"],
				"viz/scatter_matrix" : ["legend", "datalabels"],
				"viz/treemap" : ["legend"],
				"viz/heatmap" : ["legend", "datalabels"],
				"viz/table" : ["datalabels"],
				"viz/radar" : ["legend", "datalabels"],
				"viz/boxplot" : ["legend", "direction", "datalabels"],
				"viz/waterfall" : ["direction", "datalabels"],
				"viz/tagcloud" : ["legend"]
			}
		}, {
			"type" : "vizContainer/TitleEditor",
			"visible" : false,
			"enableRestore" : true
		}, {
			"type" : "vizContainer/DataInteractionPanel",
			"enabled" : true
		}]
	};
	VizContainer.DEFAULT_PROPERTIES = {
		title : {
			visible : false
		},
		tooltip : {
			visible : true
		},
		dataLabel : {
			visible : false
		},
		plotArea : {
			animation : {
				dataLoading : false,
				dataUpdating : false,
				resizing : false
			}
		},
		legend : {
			visible : true
		}
	};
})(jQuery);
