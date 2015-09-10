(function() {
    var grace = andrea.grace;

    var DataSourceEvent = grace.views.analysisContainer.events.DataSourceEvent;
    var MoreButton = grace.views.components.MoreButton;

    andrea.blink.declare('andrea.grace.views.dataSources.DataSourceBase');
    var DataSourceBase = andrea.grace.views.dataSources.DataSourceBase = function(div) {
        DataSourceBase.superclass.constructor.apply(this, arguments);

        this._swfReady = false;

        this._state = DataSourceBase.STATE_NORMAL;
        this._progress = null;

        this._options = null;
    };
    andrea.blink.extend(DataSourceBase, andrea.blink.mvc.View);

    DataSourceBase.STATE_NORMAL = 'normal';
    DataSourceBase.STATE_LOADING = 'loading';

    DataSourceBase.prototype.state = function(value) {
        if (arguments.length > 0) {
            this._state = value;
            this.dispatchEvent(new DataSourceEvent(DataSourceEvent.STATE_CHANGED, this));
            return this;
        } else {
            return this._state;
        }
    };
    DataSourceBase.prototype.progress = function(value) {
        if (arguments.length > 0) {
            this._progress = value;
            this.state(DataSourceBase.STATE_LOADING);
            return this;
        } else {
            return this._progress;
        }
    };

    DataSourceBase.prototype.keyword = function() {
        return null;
    };
    DataSourceBase.prototype._encode = function(o) {
        var s = JSON.stringify(o);
        s = s.replace(/%/g, '%25');
        s = s.replace(/\\/g, '%5C');
        s = s.replace(/\"/g, '%22');
        return s;
    };
    DataSourceBase.prototype._decode = function(s) {
        s = s.replace(/%22/g, '\"');
        s = s.replace(/%5C/g, '\\');
        s = s.replace(/%25/g, '%');
        return JSON.parse(s);
    };

    /**
     *
     * @param {Object} settings {
     *     color,
     *     caption
     * }
     */
    DataSourceBase.prototype._generateButton = function($container, settings) {
        if ($container.length === 0) {
            return;
        }
        var $dom = $container.addClass('grace-dataSource-main-example').css('background-color', settings.color);
        var $p1 = $('<div/>').appendTo($dom).addClass('grace-dataSource-main-example-p1');
        var $caption = $('<div/>').appendTo($p1).addClass('grace-dataSource-main-example-p1-caption');
        _.each(settings.captions, function(caption) {
            var size = $dom.height() - 25 * 2 + (settings.captions.length - 1);
            size = Math.floor(size / settings.captions.length);

            var $span = $('<span/>').appendTo($caption).text(caption).css('font-size', size + 'px');
            var minus = 1;
            while ($span.height() > (size + 2) || $span.width() > ($dom.width() - 15)) {
                $span.css('font-size', size - minus + 'px');
                minus++;
            }
            $('<br/>').appendTo($caption).css('line-height', size + 'px');
        });
        $caption.children().last().detach();
        $caption.css({
            'top' : ($container.height() - $caption.height()) / 2 + (settings.link ? -2 : 4),
            'left' : ($container.width() - $caption.width()) / 2
        });

        if (settings.link) {
            var $download = $('<a/>').appendTo($p1).addClass('grace-dataSource-main-example-p2-download');
            $download.text(settings.link.text).css('color', '#e59999');
            $download.attr({
                'target' : '_blank',
                'href' : settings.link.url,
                'title' : '右键，另存为…'
            });
            $download.on('click', function(event) {
                event.stopPropagation();
            });
        }
    };

    // /**
    // *
    // * @param {Object} settings {
    // *     color,
    // *     caption,
    // *     description
    // * }
    // */
    // DataSourceBase.prototype._generateMore = function($container, settings) {
    // var $dom = $container.addClass('grace-dataSource-main-example');
    // var $more = $('<div/>').appendTo($dom).addClass('grace-dataSource-main-example-more');
    // // P1
    // var $p1 = $('<div/>').appendTo($more).addClass('grace-dataSource-main-example-p1').css('background-color',
    // settings.color);
    // var $caption = $('<div/>').appendTo($p1).addClass('grace-dataSource-main-example-p1-caption');
    // _.each(settings.captions, function(caption) {
    // $('<span/>').appendTo($caption).text(caption);
    // $('<br/>').appendTo($caption).css('line-height', 30 + 'px');
    // });
    // $caption.children().last().detach();
    // $caption.css({
    // 'top' : ($container.height() - $caption.height()) / 2,
    // 'left' : ($container.width() - $caption.width()) / 2
    // });
    // // P2
    // var $p2 = $('<div/>').appendTo($more).addClass('grace-dataSource-main-example-p2');
    // $('<div/>').appendTo($p2).addClass('grace-dataSource-main-example-p2-ribbon').css('background-color',
    // settings.color);
    // $('<div/>').appendTo($p2).addClass('grace-dataSource-main-example-p2-icon');
    // $('<div/>').appendTo($p2).addClass('grace-dataSource-main-example-p2-text').text(settings.description);
    //
    // if (settings.link) {
    // var $download = $('<a/>').appendTo($p2).addClass('grace-dataSource-main-example-p2-download');
    // $download.text(settings.link.text).css('color', settings.color);
    // $download.attr({
    // 'target' : '_blank',
    // 'href' : settings.link.url,
    // 'title' : '右键，另存为…'
    // });
    // $download.on('click', function(event) {
    // event.stopPropagation();
    // });
    // }
    // // More button
    // return new MoreButton($more[0]);
    // };
    DataSourceBase.prototype._swfReadyHandler = function() {
        this._swfReady = true;
    };
    DataSourceBase.prototype._embedSWF = function($ph, name, swfURL, wmode, w, h, flashvars) {
        var uid = _.uniqueId('flashContent_');

        var params = {};
        params.quality = 'high';
        params.bgcolor = '#ffffff';
        params.allowscriptaccess = 'sameDomain';
        params.allowfullscreen = 'true';
        params.wmode = wmode;
        var attributes = {};
        attributes.id = name;
        attributes.name = name;
        attributes.align = 'middle';

        $ph.attr('id', uid);
        swfobject.embedSWF(swfURL, uid, w, h, '11.0.0', null, flashvars, params, attributes);
    };
    DataSourceBase.prototype._getSWF = function(selector, callback) {
        var check = $.proxy(function() {
            var $swf = $(selector);
            if ($swf[0] && this._swfReady) {
                callback($swf[0]);
            } else {
                _.delay(check, 100);
            }
        }, this);
        check();
    };
    DataSourceBase.prototype._stringDataReady = function(rows, columnDescriptors) {
        var dp = {
            'rows' : _.isString(rows) ? this._decode(rows) : rows,
            'columnDescriptors' : _.isString(columnDescriptors) ? this._decode(columnDescriptors) : columnDescriptors,
            'source' : 'excel'
        };
        this._dpReady(dp);
    };
    DataSourceBase.prototype._dpReady = function(dp) {
        this.dispatchEvent(new DataSourceEvent(DataSourceEvent.DATA_PROVIDER_READY, this, {
            'dataProvider' : dp,
            'dsInfo' : this._options
        }));
    };
})();
