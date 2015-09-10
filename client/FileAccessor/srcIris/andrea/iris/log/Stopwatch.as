package andrea.iris.log {

	public class Stopwatch {
		public var type:String;

		public function Stopwatch(type:String, startImmediately:Boolean = false) {
			this.type = type;

			if (startImmediately) {
				this.start();
			}
		}
		private var _s:Number;
		private var _laps:Array;

		public function start():void {
			_s = new Date().getTime();
			_laps = [];
		}

		public function lap():Number {
			_laps.push(new Date().getTime());
			if (_laps.length > 1) {
				return _laps[_laps.length - 1] - _laps[_laps.length - 2];
			} else {
				return _laps[0] - _s;
			}
		}

	}
}
