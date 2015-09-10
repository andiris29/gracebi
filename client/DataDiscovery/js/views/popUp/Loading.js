(function($) {
    var grace = andrea.grace;

    var PopUpManager = grace.managers.PopUpManager;

    andrea.blink.declare('andrea.grace.views.popUp.Loading');
    var Loading = grace.views.popUp.Loading = function(dom, label) {
        Loading.superclass.constructor.apply(this, arguments);

        this._classVisible = 'grace-loading-visible';
        this._visibleAnimationDuration = 300;
        this._$spin = null;
        this._spinner = null;

        this._label = label;
        this._percent = 0;
        this._$label = null;

        this._createChildren();
    };
    andrea.blink.extend(Loading, grace.views.popUp.PopUpBase);

    Loading.prototype.open = function($dock, model) {
        Loading.superclass.open.apply(this, arguments);

        if (this._label == null) {
            this._$dom.width(90);
            this._$dom.height(90);
        } else {
            this._$dom.width(90);
            this._$dom.height(105);
            this._$label = $('<div/>').addClass('grace-loading-label').appendTo(this._$dom);
            this._validateLabel();
        }
        this._$spin.width(this._$dom.width());
        this._$spin.height(90);
        this._spinner = new Spinner({
            'color' : '#ffffff'
        });
        this._spinner.spin(this._$spin[0]);

        PopUpManager.centerPopUp(this, $dock);
    };
    Loading.prototype.percent = function(value) {
        this._percent = value;
        this._validateLabel();
    };
    Loading.prototype._validateLabel = function() {
        var caption = Math.min(99, Math.round(this._percent * 100)) + '%';
        if (this._label) {
            caption = this._label + ': ' + caption;
        }
        this._$label.text(caption);
    };
    Loading.prototype._createChildren = function() {
        this._$dom.addClass('grace-loading');

        this._$spin = $('<div/>').addClass('grace-loading-spin').appendTo(this._$dom);
    };
})(jQuery);
