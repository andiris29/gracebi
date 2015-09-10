(function() {
    var grace = andrea.grace;
    var MoreButton = grace.views.components.MoreButton;
    var DataSourceEvent = grace.views.analysisContainer.events.DataSourceEvent;

    andrea.blink.declare("andrea.grace.DataSource");
    var DataSource = grace.DataSource = function(div) {
        DataSource.superclass.constructor.apply(this, arguments);

        this._$main = $('.grace-dataSource-main', this._$dom);

        this._btnAnalysis = null;
        this._$btnAnalysis = null;
        this._$btnEgs = null;

        this._createChildren();
    };
    andrea.blink.extend(DataSource, andrea.blink.mvc.View);

    DataSource.prototype.flashHoverHandler = function(hover) {
        if (hover) {
            this._btnAnalysis.showP2();
        } else {
            this._btnAnalysis.showP1();
        }
    };
    DataSource.prototype.flashStartProccessHandler = function(hover) {
        this._addSpinner(this._$btnAnalysis[0]);
    };

    DataSource.prototype.flashDataHandler = function(rows, columnDescriptors) {
        // Write some log for eg
        // var egJS = '';
        // egJS += 'this.columnDescriptors = \'' + columnDescriptors.replace(/\'/g, '\\\'') + '\';' + '\n';
        // egJS += 'this.rows = \'' + rows.replace(/\'/g, '\\\'') + '\';' + '\n';
        // console.log(egJS);
        // Defer for performance log
        _.defer($.proxy(function() {
            this._stringDataHandler(rows, columnDescriptors);
        }, this));
        return true;
    };
    DataSource.prototype._stringDataHandler = function(rows, columnDescriptors) {
        this._dpReady({
            'rows' : _.isString(rows) ? this._decode(rows) : rows,
            'columnDescriptors' : _.isString(columnDescriptors) ? this._decode(columnDescriptors) : columnDescriptors,
            'source' : 'excel'
        });
    };
    DataSource.prototype._encode = function(o) {
        var s = JSON.stringify(o);
        s = s.replace(/%/g, '%25');
        s = s.replace(/\\"/g, '%22');
        return s;
    };
    DataSource.prototype._decode = function(s) {
        s = s.replace(/%22/g, '\\"');
        s = s.replace(/%25/g, '%');
        return JSON.parse(s);
    };
    DataSource.prototype._addSpinner = function(target) {
        var spinner = new Spinner();
        spinner.spin(this._$main[0]);
        this._$main.css('pointer-events', 'none');
    };
    DataSource.prototype._loadEg = function(jsPath, jsClassName) {
        this._addSpinner();
        LazyLoad.js([jsPath], $.proxy(function() {
            var dp = new grace.eg[jsClassName]();
            this._stringDataHandler(dp.rows, dp.columnDescriptors);
        }, this));
    };
    DataSource.prototype._dpReady = function(dp) {
        this.dispatchEvent(new DataSourceEvent(DataSourceEvent.DATA_SOURCE_READY, this, dp));
    };
    DataSource.prototype._createChildren = function() {
        var $btnAnalysis = this._$btnAnalysis = this._createButtonAnalysis(this._$main);
        $btnAnalysis.css({
            'left' : 90 + 'px',
            'top' : 120 + 'px'
        });
        // Add Flash
        var $swf = $('<div/>').appendTo(this._$main);
        var $flashPH = $('<div/>').appendTo($swf);
        this._embedFlash($flashPH, $btnAnalysis.width(), $btnAnalysis.height());
        $swf.css({
            'z-index' : 10000,
            'position' : 'absolute',
            'left' : parseFloat($btnAnalysis.css('left')) + 1,
            'top' : parseFloat($btnAnalysis.css('top')) + 1,
            'width' : $btnAnalysis.width(),
            'height' : $btnAnalysis.height()
        });

        var $customize = $('<a/>').appendTo(this._$main).attr('href', 'mailto:kapianfenxi@gmail.com?subject=添加自定义数据源&body=<请描述您的数据源，作者会尽量在三个工作日内给您回复。>');
        $customize.text('添加自定义数据源…');
        $customize.attr('title', '网页、数据库、系统中的数据都可以，把它集成到“卡片分析”中吧！');
        $customize.css({
            'font-size' : 15 + 'px',
            'color' : '#3498db',
            'position' : 'absolute',
            'left' : 90 + 'px',
            'top' : 320 + 'px'
        });
        var $btnEg;
        this._$btnEgs = [];
        // Eg 1
        $btnEg = this._createButtonEg(this._$main, {
            'name' : 'WorldBank',
            'caption' : '样例1：世界银行指标',
            'description' : '2000-2008年世界银行所公布的各国家数据指标。涵盖股市、财务、商业、军事等…'
        });
        $btnEg.css({
            'left' : 530 + 'px',
            'top' : 120 + 'px'
        });
        this._$btnEgs.push($btnEg);
        // Eg 2
        $btnEg = this._createButtonEg(this._$main, {
            'name' : 'SuperMarket',
            'caption' : '样例2：超市销售情况',
            'description' : '真实的超市销售数据，让您可以从时间、空间、类别等多方面来分析销售状况…'

        });
        $btnEg.css({
            'left' : 530 + 'px',
            'top' : 215 + 'px'
        });
        this._$btnEgs.push($btnEg);
    };
    DataSource.prototype._embedFlash = function($swf, w, h) {
        var uid = _.uniqueId('flashContent_');
        var folder = '../DataProcessor/bin-release/';

        var flashvars = {
            'alpha' : 0,
            'width' : w,
            'height' : h,
            'dataCallback' : 'andrea.grace.Grace.flashDataCallback',
            'hoverCallback' : 'andrea.grace.Grace.flashHoverCallback',
            'startProccessCallback' : 'andrea.grace.Grace.flashStartProccessCallback'
        };
        var params = {};
        params.quality = "high";
        params.bgcolor = "#ffffff";
        params.allowscriptaccess = "sameDomain";
        params.allowfullscreen = "true";
        params.wmode = 'transparent';
        var attributes = {};
        attributes.id = "DataProcessor";
        attributes.name = "DataProcessor";
        attributes.align = "middle";

        $swf.attr('id', uid);
        swfobject.embedSWF(folder + '/DataProcessor.swf', uid, w, h, '11.0.0', folder + 'playerProductInstall.swf', flashvars, params, attributes);
    };

    DataSource.prototype._createButtonAnalysis = function($parent) {
        var $dom = $('<div/>').addClass('grace-dataSource-main-analysis');
        var $more = $('<div/>').appendTo($dom).addClass('grace-dataSource-main-analysis-more');
        // P1
        var $p1 = $('<div/>').appendTo($more).addClass('grace-dataSource-main-analysis-p1');
        $('<span/>').appendTo($p1).text('分析…');
        // P2
        var $p2 = $('<div/>').appendTo($more).addClass('grace-dataSource-main-analysis-p2');
        $('<div/>').appendTo($p2).addClass('grace-dataSource-main-analysis-p2-ribbon');
        $('<div/>').appendTo($p2).addClass('grace-dataSource-main-analysis-p2-icon');
        $('<div/>').appendTo($p2).addClass('grace-dataSource-main-analysis-p2-text').text('分析数据文件：xlsx 或 csv');
        // More button
        this._btnAnalysis = new MoreButton($more[0]);

        $dom.appendTo($parent);

        return $dom;
    };
    /**
     *
     * @param {Object} eg {
     *     caption,
     *     description
     * }
     */
    DataSource.prototype._createButtonEg = function($parent, eg) {

        var $dom = $('<div/>').addClass('grace-dataSource-main-example');
        var $more = $('<div/>').appendTo($dom).addClass('grace-dataSource-main-example-more');
        // P1
        var $p1 = $('<div/>').appendTo($more).addClass('grace-dataSource-main-example-p1');
        $('<span/>').appendTo($p1).text(eg.caption);
        // P2
        var $p2 = $('<div/>').appendTo($more).addClass('grace-dataSource-main-example-p2');
        $('<div/>').appendTo($p2).addClass('grace-dataSource-main-example-p2-ribbon');
        $('<div/>').appendTo($p2).addClass('grace-dataSource-main-example-p2-icon');
        $('<div/>').appendTo($p2).addClass('grace-dataSource-main-example-p2-text').text(eg.description);

        var $download = $('<a/>').appendTo($p2).addClass('grace-dataSource-main-example-p2-download').text('下载数据…');
        $download.attr({
            'target' : '_blank',
            'href' : 'js/eg/' + eg.name + '.xlsx'
        });
        $download.on('click', function(event) {
            event.stopPropagation();
        })
        // More button
        new MoreButton($more[0]);

        $dom.appendTo($parent);

        $dom.on('click', $.proxy(function(event) {
            this._loadEg('js/eg/' + eg.name + '.js', eg.name);
        }, this));
        return $dom;

    };
})();
