(function() {
	var vc = sap.viz.container;
	vc.declare("sap.viz.container.grace.views.events.ColumnContainerEvent");

	var ColumnContainerEvent = vc.grace.views.events.ColumnContainerEvent = function(type, target, data) {
		ColumnContainerEvent.superclass.constructor.apply(this, arguments);

	};
	vc.extend(ColumnContainerEvent, vc.common.events.Event);

	ColumnContainerEvent.COLUMN_CHANGED = "columnChanged";
})();
