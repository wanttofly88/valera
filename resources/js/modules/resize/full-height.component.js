define(['dispatcher'], function(dispatcher) {
	"use strict";

	// mostly for some ios safari wierdness

	var elementProto = function() {
		var _resizeHandler = function() {
			var wh = window.innerHeight;
			if (this.clientHeight === wh) return;
			this.style.height = window.innerHeight + 'px';
		}

		var createdCallback = function() {
			this._resizeHandler = _resizeHandler.bind(this);
		}
		var attachedCallback = function() {
			this._resizeHandler();
			window.addEventListener('resize', this._resizeHandler);
		}
		var detachedCallback = function() {
			window.removeEventListener('resize', this._resizeHandler);
		}

		return {
			createdCallback: createdCallback,
			attachedCallback: attachedCallback,
			detachedCallback: detachedCallback
		}
	}();


	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('full-height', {
		prototype: elementProto,
	});
});