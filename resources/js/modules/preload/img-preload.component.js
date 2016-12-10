define(['dispatcher', 'resize/breakpoint.store'], function(dispatcher, breakpointStore) {
	"use strict";

	var elementProto = function() {
		var _handleLoadOnce = function() {
			var event = new Event('loadonce');
			this.dispatchEvent(event);
			this.loadedOnce = true;
			this.removeEventListener('load', _handleLoadOnce);

		}

		var _handleBreakpoints = function() {
			var windowBreakpoint = breakpointStore.getData().name;

			if (this.breakpoint === windowBreakpoint) return;

			if (!this.sources.hasOwnProperty(windowBreakpoint)) {
				console.warn('no source image for breakpoint ' + windowBreakpoint);
				return;
			}

			this.breakpoint = windowBreakpoint;
			this.addEventListener('load', _handleLoadOnce);
			this.src = this.sources[windowBreakpoint];
		}

		var createdCallback = function() {
			_handleBreakpoints = _handleBreakpoints.bind(this);
			_handleLoadOnce = _handleLoadOnce.bind(this);
			this.breakpoint = null;
			this.loadedOnce = false;
		}
		var attachedCallback = function() {
			var srcDesktop = this.getAttribute('data-desktop-src');
			var srcTablet  = this.getAttribute('data-tablet-src') || srcDesktop;
			var srcMobile  = this.getAttribute('data-mobile-src') || srcTablet;

			this.sources = {
				desktop: srcDesktop,
				tablet: srcTablet,
				mobile: srcMobile
			}

			_handleBreakpoints();
			breakpointStore.eventEmitter.subscribe(_handleBreakpoints);
		}
		var detachedCallback = function() {
			breakpointStore.eventEmitter.unsubscribe(_handleBreakpoints);
		}


		return {
			createdCallback: createdCallback,
			attachedCallback: attachedCallback,
			detachedCallback: detachedCallback
		}
	}();


	Object.setPrototypeOf(elementProto, HTMLImageElement.prototype);
	document.registerElement('img-preload', {
		extends: 'img',
		prototype: elementProto
	});
});