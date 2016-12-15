define(['dispatcher'], function(dispatcher) {
	"use strict";

	var elementProto = function() {
		var handleResize = function() {
			var parentWidth = this.parentNode.clientWidth;

			// yep. don't question me!

			this.style.fontSize = 2836/950 + 243.3/950*parentWidth + 'px';
			this.style.left = -7050/950 - 35/950*parentWidth + 'px';
		}

		var createdCallback = function() {
			this._handleResize = handleResize.bind(this);
		}
		var attachedCallback = function() {
			this._handleResize();
			window.addEventListener('resize', this._handleResize);
		}
		var detachedCallback = function() {
			window.removeEventListener('resize', this._handleResize);
		}


		return {
			createdCallback: createdCallback,
			attachedCallback: attachedCallback,
			detachedCallback: detachedCallback
		}
	}();


	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('full-text', {
		prototype: elementProto
	});
});