(function() {
    var grace = andrea.grace;

    andrea.blink.declare('andrea.grace.views.dataSources.Customize');
    var Customize = andrea.grace.views.dataSources.Customize = function(div) {
        Customize.superclass.constructor.apply(this, arguments);

        this._createChildren();
    };
    andrea.blink.extend(Customize, andrea.grace.views.dataSources.DataSourceBase);

    Customize.prototype._createChildren = function() {
        var $container = this._$dom;
        $container.on('click', $.proxy(function(event) {
            window.location.href = 'mailto:andiris29@gmail.com?subject=添加定制数据源&body=<请描述您的数据源（如数据库地址、网页地址等）。作者会在2个工作日内给您回复。';
        }, this));

        this._generateButton($container, {
            'color' : '#3498db',
            'captions' : ['定制', '数据源…']
        });
    };
})();
