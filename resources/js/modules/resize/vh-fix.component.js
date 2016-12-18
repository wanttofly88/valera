define(['dispatcher'], function(dispatcher) {
	"use strict";

	// mostly for some ios safari wierdness

	var elementProto = function() {
		var resizeHandler = function() {
			var wh = window.innerHeight;
			if (!this._handledCollection || this._handledCollection.length === 0) return;
			Array.prototype.forEach.call(this._handledCollection, function(element) {
				if (element.clientHeight === wh) return;
				element.style.height = window.innerHeight + 'px';
			});
		}

		var createdCallback = function() {
			this._resizeHandler = resizeHandler.bind(this);
		}
		var attachedCallback = function() {
			this._handledCollection = document.getElementsByClassName('vh-height');
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
	document.registerElement('vh-fix', {
		prototype: elementProto,
	});
});