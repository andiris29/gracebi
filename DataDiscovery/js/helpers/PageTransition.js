(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.helpers.PageTransition");
    /**
     * out, in {
     *     $page
     *     classes
     * }
     */
    var PageTransition = grace.helpers.PageTransition = function(outObj, inObj, endCallback) {
        this._$outPage = outObj['$page'];        this._outClass = outObj.classes.join(' ');
        this._$inPage = inObj['$page'];
        this._inClass = inObj.classes.join(' ');

        this._endCallback = endCallback;

        this._inEnded = false;
        this._outEnded = false;
    };
    PageTransition.prototype.$outPage = function() {
        return this._$outPage;
    };
    PageTransition.prototype.$inPage = function() {
        return this._$inPage;
    };
    PageTransition.prototype.play = function() {
        // Play animation
        if (this._outClass) {
            this._$outPage.addClass(this._outClass).on('webkitAnimationEnd', $.proxy(function() {
                this._$outPage.off('webkitAnimationEnd');

                this._inEnded = true;
                this._animationEndHandler();
            }, this));
        } else {
            this._inEnded = true;
            this._animationEndHandler();
        }

        if (this._inClass) {
            this._$inPage.addClass(this._inClass).on('webkitAnimationEnd', $.proxy(function() {
                this._$inPage.off('webkitAnimationEnd');

                this._outEnded = true;
                this._animationEndHandler();
            }, this));
        } else {
            this._outEnded = true;
            this._animationEndHandler();
        }
    };
    PageTransition.prototype._animationEndHandler = function() {
        if (!this._inEnded || !this._outEnded) {
            return;
        }
        // Reset pages
        this._$outPage.removeClass(this._outClass);
        this._$inPage.removeClass(this._inClass);

        // Reset flags
        this._inEnded = false;
        this._outEnded = false;

        // Callback
        if (this._endCallback) {
            this._endCallback.call(this);
        }
    };
})();
