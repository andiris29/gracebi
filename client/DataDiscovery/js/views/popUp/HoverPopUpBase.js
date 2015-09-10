(function($) {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.views.popUp.HoverPopUpBase");

    var HoverPopUpBase = grace.views.popUp.HoverPopUpBase = function(dom) {
        HoverPopUpBase.superclass.constructor.apply(this, arguments);
        this._hover = null;
        this._click = null;
        this._mousedown = null;
        this._mouseup = null;
    };
    andrea.blink.extend(HoverPopUpBase, grace.views.popUp.PopUpBase);

    HoverPopUpBase.prototype.open = function($dock) {
        HoverPopUpBase.superclass.open.apply(this, arguments);
        this._closeByHover(true);
        this._closeByClick(true);
    };
    HoverPopUpBase.prototype.close = function() {
        HoverPopUpBase.superclass.close.apply(this, arguments);
        this._closeByHover(false);
        this._closeByClick(false);
    };
    HoverPopUpBase.prototype._closeByClick = function(activate) {
        if (activate) {
            var _this = this;

            var click = this._click = $.proxy(function(event) {
                if (this._$dom[0] != event.target && !$.contains(this._$dom[0], event.target)) {
                    if (this._$dock[0] != event.target && !$.contains(this._$dock[0], event.target)) {
                        this.close();
                    }
                }
            }, this);
            $(document.body).on('click', click).on('touchstart', click);
        } else {
            $(document.body).off('click', this._click).off('touchstart', this._click);
        }
    };

    HoverPopUpBase.prototype._closeByHover = function(activate) {
        if (activate) {
            var _this = this;
            // Event lisenter
            var inside = true;
            var operating = false;
            var closeOutside = function() {
                if (operating) {
                    return;
                }
                // Delay serveral ms to wait moving to submenu
                setTimeout(function() {
                    if (!inside) {
                        _this.close();
                    }
                }, 120)
            }
            var hover = this._hover = function(event) {
                // console.log(event.type, event.currentTarget)
                if (event.type === 'mouseenter') {
                    inside = true;
                } else if (event.type === 'mouseleave') {
                    inside = false;
                    closeOutside();
                }
            };
            var mousedown = this._mousedown = function() {
                operating = true;
            }
            var mouseup = this._mouseup = function() {
                operating = false;
                if (!inside) {
                    closeOutside();
                }
            }
            this._$dock.on('hover', hover);
            this._$dom.on('hover', hover);
            this._$dom.on('mousedown', mousedown);
            $(document.body).on('mouseup', mouseup);
        } else {
            this._$dock.off('hover', this._hover);
            this._$dom.off('hover', this._hover);
            this._$dom.off('mousedown', this._mousedown);
            $(document.body).off('mouseup', this._mouseup);

        }
    };
})(jQuery);
