(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.utils.Stopwatch");

    var Stopwatch = grace.utils.Stopwatch = function(type, startImmediately) {
        this._s = null;
        this._e = null;
        this._laps = null;

        this.type = type;
        if (startImmediately === true) {
            this.start();
        }
    };
    Stopwatch.prototype.start = function() {
        this._s = new Date().getTime();
        this._laps = [];
    };
    Stopwatch.prototype.lap = function(last) {
        var laps = this._laps;
        laps.push(new Date().getTime());

        if (last === true) {
            this._e = laps[laps.length - 1];
        }

        if (laps.length > 1) {
            return laps[laps.length - 1] - laps[laps.length - 2];
        } else {
            return laps[0] - this._s;
        }
    };
    Stopwatch.prototype.total = function() {
        return this._e - this._s;
    };
})();
