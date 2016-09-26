define(['dispatcher', 'full-text/font-size.store', 'resize/resize.store'], function(dispatcher, fzStore, resizeStore) {

	"use strict";
	var containers;
	var wrapper;

	var _handleChange = function() {
		var storeData = fzStore.getData();
		for (var i = containers.length - 1; i >= 0; i--) {
			containers[i].style.fontSize = storeData.fontSize + 'px';
		}
	}

	var _handleResize = function() {
		var storeData = resizeStore.getData();
		var ww = wrapper.clientWidth;
		dispatcher.dispatch({
			type: 'full-text-change',
			fontSize: 167/7 + 92/385*ww //yep. don't question me!
		});
	}

	var _handleMutate = function() {
		wrapper = document.getElementsByClassName('wrapper')[0];
		containers = document.getElementsByClassName('js-full-text');
	}

	var init = function() {
		_handleMutate();
		fzStore.eventEmitter.subscribe(_handleChange);

		_handleResize();
		resizeStore.eventEmitter.subscribe(_handleResize);

		dispatcher.subscribe(function(e) {
			if (e.type === 'mutate') {
				_handleMutate();
				_handleChange();
			}
		});
	}

	return {
		init: init
	}
});