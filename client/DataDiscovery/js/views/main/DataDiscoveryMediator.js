(function($) {

    var grace = andrea.grace;

    andrea.blink.declare('andrea.grace.DataDiscoveryMediator');

    var AppConst = grace.constants.AppConst;
    /**
     * App Mediator.
     */
    var DataDiscoveryMediator = andrea.grace.DataDiscoveryMediator = function(view) {
        DataDiscoveryMediator.superclass.constructor.apply(this, arguments);

        this._view = view;
        this._model = null;
    };

    andrea.blink.extend(DataDiscoveryMediator, andrea.blink.mvc.ViewMediator);

    DataDiscoveryMediator.prototype.rowBasedDataProvider = function(rows, columnDescriptors, source) {
        var model = this._getModel(AppConst.MODEL_GRACE);

        this._subscribe(AppConst.NOTIFICATION_VIZ_CONTEXT_CHANGED, $.proxy(function(notification) {
            this._view.vizContextChanged(model.analysisDatas().length);
        }, this));

        this._action(AppConst.ACTION_CHANGE_DATA_PROVIDER, {
            'rows' : rows,
            'columnDescriptors' : columnDescriptors,
            'source' : source
        });

        this._subscribe(AppConst.NOTIFICATION_ACTION_SAVE_COLLABORATION_START, $.proxy(function(notification) {
            this._view.addLoading();
        }, this));
        this._subscribe(AppConst.NOTIFICATION_ACTION_SAVE_COLLABORATION_COMPLETE, $.proxy(function(notification) {
            this._view.removeLoading();

            var url = grace.Settings.home + '?collab=' + notification.data.sn;

            alertify.reset();
            alertify.set({
                'labels' : {
                    'ok' : '复制',
                    'cancel' : '跳转至...'
                },
                'buttonFocus' : 'ok'
            });
            alertify.confirm('保存成功：' + url, function(confirmed) {
                if (!confirmed) {
                    _.delay(function() {
                        window.open(url, '_blank');
                    }, 500);
                }
            });
            var alertify$ = $('#alertify');
            var ok$ = $('.alertify-button-ok', alertify$);
            ok$.attr('data-clipboard-text', url);
            var client = ZeroClipboard(ok$);
            client.on('complete', function(client, args) {
                ok$[0].click();
                alertify.success('成功将保存地址写入剪贴板。');
            });
        }, this));
    };
    DataDiscoveryMediator.prototype.loadCollaboration = function() {
        this._action(AppConst.ACTION_LOAD_COLLABORATION);
    };

})(jQuery);
