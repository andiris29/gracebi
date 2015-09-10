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
        this._$outPage = outObj['$page'];
        this._outClasses = outObj.classes.join(' ');
        this._outDelay = outObj.delay;
        this._$inPage = inObj['$page'];
        this._inClasses = inObj.classes.join(' ');
        this._inDelay = inObj.delay;

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
        if (this._outClasses) {
            var playOut = $.proxy(function() {
                this._$outPage.addClass(this._outClasses).on('webkitAnimationEnd', $.proxy(function() {
                    this._$outPage.off('webkitAnimationEnd');

                    this._inEnded = true;
                    this._animationEndHandler();
                }, this));
            }, this);

            if (this._outDelay) {
                _.delay(playOut, this._outDelay);
            } else {
                playOut();
            }
        } else {
            this._inEnded = true;
            this._animationEndHandler();
        }

        if (this._inClasses) {
            var playIn = $.proxy(function() {
                this._$inPage.show(0);
                this._$inPage.addClass(this._inClasses).on('webkitAnimationEnd', $.proxy(function() {
                    this._$inPage.off('webkitAnimationEnd');

                    this._outEnded = true;
                    this._animationEndHandler();
                }, this));
            }, this);
            if (this._inDelay) {
                this._$inPage.hide(0);
                _.delay(playIn, this._inDelay);
            } else {
                playIn();
            }
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
        this._$outPage.removeClass(this._outClasses);
        this._$inPage.removeClass(this._inClasses);

        // Reset flags
        this._inEnded = false;
        this._outEnded = false;

        // Callback
        if (this._endCallback) {
            this._endCallback.call(this);
        }
    };
})();
