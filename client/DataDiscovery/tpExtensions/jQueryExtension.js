/**
 * Dependencies
 * 	jquery-1.8.3
 *
 */
(function($) {
    $.fn.appendAt = function(element, index) {
        var children = this.children();
        if (index < 0) {
            if (children.length > 0) {
                $(children[0]).before(element);
            } else {
                this.append(element);
            }
        } else {
            if (index < children.length) {
                $(children[index]).before(element);
            } else {
                this.append(element);
            }
        }
    };
    $.fn.vMargin = function() {
        return parseInt(this.css("margin-top")) + parseInt(this.css("margin-bottom"));
    };
    $.fn.hMargin = function() {
        return parseInt(this.css("margin-left")) + parseInt(this.css("margin-right"));
    };
    $.fn.vPadding = function() {
        return parseInt(this.css("padding-top")) + parseInt(this.css("padding-bottom"));
    };
    $.fn.hPadding = function() {
        return parseInt(this.css("padding-left")) + parseInt(this.css("padding-right"));
    };
    $.fn.layoutWidth = function() {
        return this.outerWidth() + this.hMargin();
    };
    $.fn.layoutHeight = function() {
        return this.outerHeight() + this.vMargin();
    };
    $.browser.chrome = /chrom(e|ium)/.test(navigator.userAgent.toLowerCase());
})(jQuery);
