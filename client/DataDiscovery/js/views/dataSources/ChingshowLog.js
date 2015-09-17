(function() {
    var grace = andrea.grace;

    var DataSourceBase = andrea.grace.views.dataSources.DataSourceBase;
    var MoreButton = grace.views.components.MoreButton;
    var Log = grace.managers.Log;
    var ConverterType = grace.utils.ConverterType;
    var AnalysisType = andrea.grace.constants.AnalysisType;

    andrea.blink.declare('andrea.grace.views.dataSources.ChingshowLog');
    var ChingshowLog = andrea.grace.views.dataSources.ChingshowLog = function(div) {
        ChingshowLog.superclass.constructor.apply(this, arguments);

        this._more = null;

        this._hookupAPI();
    };
    andrea.blink.extend(ChingshowLog, andrea.grace.views.dataSources.DataSourceBase);

    ChingshowLog.prototype.loadURL = function(hashPairs) {
        this._load(hashPairs);
    };
    ChingshowLog.prototype.keyword = function() {
        return 'ChingshowLog';
    };
    /**
     * @param {Object} options
     *  url: *.json
     */
    ChingshowLog.prototype._load = function(options) {
        if (options.url) {
            this.state(DataSourceBase.STATE_LOADING);

            this._options = options;
            $.ajax({
                'url' : options.url,
                'dataType' : 'text',
                'crossDomain' : true
            }).done($.proxy(function(text) {
                var json = {
                    'columnDescriptors' : [
                        {'name' : 'ip', 'converterType' : ConverterType.STRING, 'analysisType' : AnalysisType.DIMENSION},
                        {'name' : 'level', 'converterType' : ConverterType.STRING, 'analysisType' : AnalysisType.DIMENSION},
                        {'name' : 'path', 'converterType' : ConverterType.STRING, 'analysisType' : AnalysisType.DIMENSION},
                        {'name' : 'timestamp', 'converterType' : ConverterType.DATE_IN_MS, 'analysisType' : AnalysisType.DIMENSION},
                        {'name' : 'cost', 'converterType' : ConverterType.NUMBER, 'analysisType' : AnalysisType.MEASURE}
                    ],
                    'rows' : [],
                    'source' : 'ChingshowLog'
                };
                text.split('\n').forEach(function(text, index) {
                    var raw;
                    try {
                        raw = JSON.parse(text);
                    } catch (err) {
                        return;
                    }
                    json.rows.push([
                        raw[json.columnDescriptors[0].name],
                        raw[json.columnDescriptors[1].name],
                        raw[json.columnDescriptors[2].name],
                        raw[json.columnDescriptors[3].name],
                        raw[json.columnDescriptors[4].name]
                    ]);
                });
                this._dpReady(json);
            }, this)).always(function() {
            });
        }
    };
    
    // ConverterType.BOOLEAN = 'boolean';
    // ConverterType.STRING = 'string';
    // ConverterType.NUMBER = 'number';
    // ConverterType.DATE_IN_EXCEL = 'dataInExcel';
    // ConverterType.DATE_IN_TEXT = 'dateInText';
    // ConverterType.DATE_IN_MS = 'dateInMS';

    ChingshowLog.prototype._hookupAPI = function() {
    };
})();
