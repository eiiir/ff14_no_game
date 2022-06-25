const Time = {
	timeSpeed: 1,
	
	origImpl: {
		setTimeout: window.setTimeout.bind(window),
		setInterval: window.setInterval.bind(window),
		dateNow: Date.now.bind(Date),
		windowPerformanceNow: window.performance.now.bind(window.performance)
	},

	/**
	 * Multiply the time speed.
	 * If set to n, n seconds are considered to be passed in 1 second in real time.
	 * 1 => Normal speed
	 * 2 => Double speed
	 * 0.5 => Half speed
	 **/
	setTimeSpeed: (s) => {
		Time.timeSpeed = s;
		window.setTimeout = (f, t) => Time.origImpl.setTimeout(f, Math.floor(t/s));
		window.setInterval = (f, t) => Time.origImpl.setInterval(f, Math.floor(t/s));
		Date.now = () => Math.floor(Time.origImpl.dateNow() * s);
		window.performance.now = () => Time.origImpl.windowPerformanceNow() * s;
	}
};
