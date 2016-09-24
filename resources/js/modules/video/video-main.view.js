define(['dispatcher', 'popup/popup.store', 'touch/touch.store'], function(dispatcher, popupStore, touchStore) {

	"use strict";

	var api = false;
	var active = false;
	var player = false;
	var isTouchDevice;

	var _handleChange = function() {
		var storeData = popupStore.getData();
		if (!player) return;

		if (storeData.active === 'video-popup' && !active) {
			active = true;
			_enable();
		}
		if (storeData.active !== 'video-popup' && active) {
			active = false;
			_disable();
		}

	}

	var _enable = function() {
		if (!player) return;
		if (!isTouchDevice) {
			player.playVideo();
		}
	}

	var _disable = function() {
		if (!player) return;
		// if (!isTouchDevice) {
			player.pauseVideo();
		// }
	}

	var _onPlayerReady = function() {

	}

	var _onPlayerStateChange = function(e) {
		if (e.data === 2 && isTouchDevice) {
			_disable();
		}
	}

	var _onApiReady = function() {
		player = new YT.Player('videoPlayer', {
			events: {
				'onReady': _onPlayerReady,
				'onStateChange': _onPlayerStateChange
			}
		});
	}
 
	var _handleMutate = function() {
		var tag;
		var firstScriptTag;
		player = false;

		isTouchDevice = touchStore.getData().isTouchDevice;

		if (!api) {
			api = true;
			tag = document.createElement('script');
			tag.src = 'http://www.youtube.com/player_api';
			firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
			window.onYouTubePlayerAPIReady = _onApiReady;
		}
	}

	var init = function() {
		_handleMutate();
		_handleChange();

		popupStore.eventEmitter.subscribe(_handleChange);

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