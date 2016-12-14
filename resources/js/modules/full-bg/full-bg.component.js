define([
	'dispatcher',
	'slide-scroll/slide-scroll.store'
], function(
	dispatcher,
	store
) {
	"use strict";

	var idName = 'slide-scroll-';
	var idNum  = 1;

	var elementProto = function() {
		var translate = function(element, position, speed) {
			element.style.transitionDuration = speed + 'ms';
			element.style.transform = 'translateY(' + position + 'px) translateZ(0)';
		}

		var resizeHandler = function() {
			var wh = window.innerHeight;
			var storeData = store.getData().items[this._id];

			if (this.clientHeight !== wh) {
				this.style.height = wh + 'px';
			}

			translate(this._wrapper, -wh*storeData.index, 0);
		}

		var touchShiftHandler = function(e) {
			var storeData = store.getData().items[this._id];
			var wh = this.clientHeight;

			translate(this._wrapper, -storeData.index*wh + e.detail/1.5 , 0);
		}

		var touchCancelHandler = function() {
			var storeData = store.getData().items[this._id];
			var wh = this.clientHeight;

			translate(this._wrapper, -storeData.index*wh , 150);
		}

		var storeHandler = function() {
			var storeData = store.getData().items[this._id];
			var wh = this.clientHeight;

			translate(this._wrapper, -wh*storeData.index, 250);
		}

		var createdCallback = function() {
			this._storeHandler  = storeHandler.bind(this);
			this._resizeHandler = resizeHandler.bind(this);
			this._touchShiftHandler = touchShiftHandler.bind(this);
			this._touchCancelHandler = touchCancelHandler.bind(this);
		}
		var attachedCallback = function() {
			this._id = this.getAttribute('data-id') || (idName + (idNum++));

			this._slideScrollComponent = document.getElementsByTagName('slide-scroll')[0];
			this._wrapper = this.getElementsByClassName('full-bg-wrapper')[0];

			this._resizeHandler();
			window.addEventListener('resize', this._resizeHandler);
			store.eventEmitter.subscribe(this._storeHandler);

			if (!this._slideScrollComponent) return;
			this._slideScrollComponent.addEventListener('touchshift', this._touchShiftHandler);
			this._slideScrollComponent.addEventListener('touchcancel', this._touchCancelHandler);
		}
		var detachedCallback = function() {
			window.removeEventListener('resize', this._resizeHandler);
			store.eventEmitter.unsubscribe(this._storeHandler);

			if (!this._slideScrollComponent) return;
			this._slideScrollComponent.removeEventListener('touchshift', this._touchShiftHandler);
			this._slideScrollComponent.removeEventListener('touchcancel', this._touchCancelHandler);
		}


		return {
			createdCallback: createdCallback,
			attachedCallback: attachedCallback,
			detachedCallback: detachedCallback
		}
	}();


	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('full-bg', {
		prototype: elementProto
	});
});