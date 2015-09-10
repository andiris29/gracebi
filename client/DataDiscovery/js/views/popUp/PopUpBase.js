(function($) {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.views.popUp.PopUpBase");

    var PopUpManager = grace.managers.PopUpManager;
    var PopUpEvent = grace.views.popUp.PopUpEvent;

    var PopUpBase = grace.views.popUp.PopUpBase = function(dom) {
        PopUpBase.superclass.constructor.apply(this, arguments);

        this.$dom().bind("selectstart", function() {
            return false;
        });

        this._classVisible = null;
        this._visibleAnimationDuration = 600;

        this._$dock = null;
    };
    andrea.blink.extend(PopUpBase, andrea.blink.mvc.View);

    PopUpBase.prototype.$dock = function() {
        return this._$dock;
    };
    PopUpBase.prototype.open = function($dock, modal) {
        this._$dock = $dock;

        var _this = this;
        var $dom = $(this._dom);
        // Initialize
        $dom.css({
            "position" : "absolute",
            "left" : $dock.offset().left,
            "top" : $dock.offset().top + $dock.outerHeight()
        });
        // Animation
        if (this._classVisible) {
            _.defer(function() {
                $dom.addClass(_this._classVisible);
            });
        }
        // Pop up
        PopUpManager.createPopUp(this, modal);

        this.dispatchEvent(new PopUpEvent(PopUpEvent.POPUP_OPENED, this));
    };
    PopUpBase.prototype.close = function(delay) {
        var _this = this;
        var $dom = $(this._dom);
        if (delay == null) {
            delay = 1;
        }
        if (this._classVisible) {
            $dom.removeClass(this._classVisible);
            delay = this._visibleAnimationDuration;
        }
        if (delay > 0) {
            setTimeout(function() {
                PopUpManager.removePopUp(_this);
            }, delay);
        } else {
            PopUpManager.removePopUp(_this);
        }

        this.dispatchEvent(new PopUpEvent(PopUpEvent.POPUP_CLOSED, this));
    };
    PopUpBase.prototype.closeImmediately = function() {
        this.close(0);
    };
})(jQuery);
