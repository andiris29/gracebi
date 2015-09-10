(function($) {
    var grace = andrea.grace;

    andrea.blink.declare('andrea.grace.managers.Log');
    var Log = grace.managers.Log;

    Log.INTERACTION = 'interaction';
    Log.PERFORMANCE = 'performance';

    Log.LINE_SPLITTER = '%LINE_SPLITTER%';

    Log._start = new Date().getTime();
    Log._uid = Log._start + '_' + _.random(0, 10000);
    Log.user = null;

    Log.console = function() {
        console.log(arguments);
    };
    Log.interaction = function(interaction, detail) {
        Log._log('info', Log.INTERACTION, [interaction, detail].join(','));
    };
    Log.performance = function(phase, detail) {
        Log._log('info', Log.PERFORMANCE, [phase, detail].join(','));
    };

    $(window).on('beforeunload', function() {
        Log.interaction('close', (new Date().getTime() - Log._start) / 1000);
        Log._releaseCache();
    });
    Log._logCache = null;
    Log._log = function(level, type, detail) {
        var prefix = [];
        prefix.push('grace_' + grace.Settings.version);
        prefix.push('log_' + grace.Settings.log.version);
        prefix.push(Log.user);
        prefix.push(Log._uid);
        prefix.push(Log._time());

        var msg = [prefix.join(','), type, detail].join(',');
        if (grace.Settings.log.console && console) {
            console.log(level, msg);
        }

        if (!Log._logCache) {
            Log._logCache = {};
            _.delay(Log._releaseCache, 10 * 1000);
        }
        if (!Log._logCache[level]) {
            Log._logCache[level] = [];
        }
        Log._logCache[level].push(msg);
    };
    Log._logServer = grace.Settings.log.url;
    Log._releaseCache = function() {
        if (!Log._logCache || !Log._logServer) {
            return;
        }
        for (var level in Log._logCache) {
            var msg = Log._logCache[level].join(Log.LINE_SPLITTER);
            $.ajax({
                'dataType' : 'json',
                'url' : Log._logServer,
                'data' : {
                    'level' : level,
                    'msg' : msg
                },
                'type' : 'POST'
            }).fail(function() {
                Log._logServer = null;
            });
        }
        Log._logCache = null;
    };
    Log._time = function() {
        var d = new Date();
        var t = d.getTime().toString();
        return d.format('yyyy/MM/dd HH:mm:ss') + ',' + t.substr(t.length - 3);
    };
})(jQuery);
