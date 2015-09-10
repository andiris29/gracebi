(function($) {

	var vc = sap.viz.container;

	vc.declare("sap.viz.container.grace.models.Column");

	var ColumnContainerType = vc.grace.constants.ColumnContainerType;

	var Column = vc.grace.models.Column = function() {
		this.id = null;
		this.name = null;
		this.type = null;
	};

})(jQuery);
