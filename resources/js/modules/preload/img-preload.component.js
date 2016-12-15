define(['dispatcher', 'resize/breakpoint.store'], function(dispatcher, breakpointStore) {
	"use strict";

	var elementProto = function() {
		var handleLoadOnce = function() {
			var event = new Event('loadonce');
			this.dispatchEvent(event);
			this.loadedOnce = true;
			this.removeEventListener('load', this._handleLoadOnce);

		}

		var handleBreakpoints = function() {
			var windowBreakpoint = breakpointStore.getData().name;

			if (this.breakpoint === windowBreakpoint) return;

			if (!this.sources.hasOwnProperty(windowBreakpoint)) {
				console.warn('no source image for breakpoint ' + windowBreakpoint);
				return;
			}

			this.breakpoint = windowBreakpoint;
			this.addEventListener('load', this._handleLoadOnce);
			this.src = this.sources[windowBreakpoint];
		}

		var createdCallback = function() {
			this._handleBreakpoints = handleBreakpoints.bind(this);
			this._handleLoadOnce = handleLoadOnce.bind(this);
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

			this._handleBreakpoints();
			breakpointStore.eventEmitter.subscribe(this._handleBreakpoints);
		}
		var detachedCallback = function() {
			breakpointStore.eventEmitter.unsubscribe(this._handleBreakpoints);
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