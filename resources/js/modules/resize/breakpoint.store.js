define(['dispatcher', 'utils'], function(dispatcher, utils) {
	var initialized = false;
	var eventEmitter;

	var breakpointsData = [
		{
			size: 0,
			name: 'mobile'
		}, {
			size: 640,
			name: 'tablet'
		}, {
			size: 1000,
			name: 'desktop'
		}
	];

	var breakpoint = false;

	var size = {
		width: 0,
		height: 0
	}

	var _windowSize = function() {
		return {
			height: window.innerHeight,
			width:  window.innerWidth
		}
	}

	var _onResize = function() {
		size = _windowSize();

		var _getBreakPoint = function() {
			for (var i = breakpointsData.length - 1; i >= 0; i--) {
				if (size.width >= breakpointsData[i].size) {
					if (breakpoint === breakpointsData[i]) return;
					breakpoint = breakpointsData[i];
					
					eventEmitter.dispatch();
					return;
				}
			}
		}

		_getBreakPoint();
	}

	var _init = function() {
		eventEmitter = new utils.EventEmitter();

		size = _windowSize();
		_onResize();
		window.addEventListener('resize', _onResize, false);
		window.addEventListener('orientationchange', _onResize, false);
		window.addEventListener('load', _onResize, false);
	}

	var getData = function() {
		return breakpoint;
	}

	if (!initialized) {
		initialized = true;
		_init();
	}

	return {
		eventEmitter: eventEmitter,
		getData: getData
	}
});