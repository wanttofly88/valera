define([
	'dispatcher',
	'slide-scroll/slide-scroll.store'
], function(
	dispatcher,
	store
) {
	"use strict";

	var elementProto = function() {
		var handleStore = function() {
			var storeData = store.getData().items[this._id];

			if (!storeData) {
				console.warn('store data is missing');
				return;
			}

			Array.prototype.forEach.call(this._links, function(link, index) {
				if (index === storeData.index) {
					link.classList.add('active');
				} else {
					link.classList.remove('active');
				}
			});
		}
		var handleClick = function(element, index) {
			var id = this._id;
			element.addEventListener('click', function() {
				dispatcher.dispatch({
					type: 'slide-scroll-to',
					id: id,
					index: index
				})
			});
		}

		var createdCallback = function() {
			this._handleStore = handleStore.bind(this);
			this._handleClick = handleClick.bind(this);
		}
		var attachedCallback = function() {
			this._id = this.getAttribute('data-id');
			this._links = this.getElementsByTagName('a');

			Array.prototype.forEach.call(this._links, this._handleClick);

			this._handleStore();
			store.eventEmitter.subscribe(this._handleStore);
		}
		var detachedCallback = function() {
			store.eventEmitter.unsubscribe(this._handleStore);
		}


		return {
			createdCallback: createdCallback,
			attachedCallback: attachedCallback,
			detachedCallback: detachedCallback
		}
	}();

	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('main-nav', {
		prototype: elementProto,
		extends: 'nav'
	});
});