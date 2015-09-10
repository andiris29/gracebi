(function() {
    var grace = andrea.grace;
    var PageTransition = grace.helpers.PageTransition;

    andrea.blink.declare("andrea.grace.views.components.MoreButton");
    var MoreButton = grace.views.components.MoreButton = function(dom) {
        MoreButton.superclass.constructor.apply(this, arguments);

        var children = this._$dom.children();
        this._$p1 = $(children[0]);
        this._$p2 = $(children[1]);
        _.defer($.proxy(function() {
            this._onTop(this._$p1)
        }, this));

        this._$dom.addClass('grace-morebutton');
        this._$p1.addClass('grace-morebutton-page');
        this._$p2.addClass('grace-morebutton-page');

        this._$dom.hover($.proxy(this.showP2, this), $.proxy(this.showP1, this));
    };
    andrea.blink.extend(MoreButton, andrea.blink.mvc.View);

    MoreButton.prototype._onTop = function($child) {
        this._$p1.removeClass('pt-page-onTop');
        this._$p2.removeClass('pt-page-onTop');
        $child.addClass('pt-page-onTop');

        this._$p1.css('width', this._$dom.width());
        this._$p1.css('height', this._$dom.height());
        this._$p2.css('width', this._$dom.width());
        this._$p2.css('height', this._$dom.height());
    };
    MoreButton.prototype.showP1 = function() {
        var pt = new PageTransition({
            '$page' : this._$p2,
            'classes' : ['pt-page-moveToBottom']
        }, {
            '$page' : this._$p1,
            'classes' : ['pt-page-moveFromTop']
        }, function() {
        });
        this._onTop(pt.$inPage());
        pt.play();
    };
    MoreButton.prototype.showP2 = function() {
        var pt = new PageTransition({
            '$page' : this._$p1,
            'classes' : ['pt-page-moveToTop']
        }, {
            '$page' : this._$p2,
            'classes' : ['pt-page-moveFromBottom']
        }, function() {
        });
        this._onTop(pt.$inPage());
        pt.play();
    };
})();
