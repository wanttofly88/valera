define(['dispatcher'], function(dispatcher) {
	"use strict";

	var minTimeout = 200;

	var elementProto = function() {
		var _handleLoad = function() {
			var totalDelay;
			var self = this;

			this.endTime = Date.now();

			totalDelay = this.endTime - this.startTime;
			if (totalDelay < minTimeout) totalDelay = minTimeout;

			setTimeout(function() {
				self.classList.add('load-complete');
				self.classList.add('load-complete-once');
				dispatcher.dispatch({
					type: 'preload-complete'
				});
			}, totalDelay);
		}

		var _handlePageMutation = function(e) {
			var plImages;
			var plVideos;
			var totalElementsToWait;
			var currentlyLoaded = 0;
			var self = this;

			var _checkLoaded = function() {
				if (currentlyLoaded >= totalElementsToWait) self._handleLoad();
			}

			var _countElement = function(element) {
				if (element.loadedOnce) {
					currentlyLoaded++;
					_checkLoaded();
				} else {
					element.addEventListener('loadonce', function() {
						currentlyLoaded++;
						_checkLoaded();
					});
				}
			}

			if (e && e.type !== 'router-replace') return;

			this.startTime = Date.now();

			plImages = document.querySelectorAll('img[is="img-preload"]');
			plVideos = document.querySelectorAll('video[is="video-preload"]');
			totalElementsToWait = plImages.length + plVideos.length;

			if (totalElementsToWait === 0) this._handleLoad();

			Array.prototype.forEach.call(plImages, _countElement);
			Array.prototype.forEach.call(plVideos, _countElement);
		}

		var createdCallback = function() {
			this._handleLoad = _handleLoad.bind(this);
			this._handlePageMutation = _handlePageMutation.bind(this);
		}

		var attachedCallback = function() {
			this._handlePageMutation();
			dispatcher.subscribe(this._handlePageMutation);
		}

		var detachedCallback = function() {
			dispatcher.unsubscribe(this._handlePageMutation);
		}


		return {
			createdCallback: createdCallback,
			attachedCallback: attachedCallback,
			detachedCallback: detachedCallback
		}
	}();


	Object.setPrototypeOf(elementProto, HTMLDivElement.prototype);
	document.registerElement('preload-component', {
		prototype: elementProto
	});
});