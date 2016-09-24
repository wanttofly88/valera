define(['dispatcher', 'resize/resize.store'], function(dispatcher, resizeStore) {

	"use strict";

	var items = {}

	var idName = 'top-scroll-id-';
	var idNum  = 1;
	var home;

	var _add = function(items, element) {
		var id = element.getAttribute('data-id');

		if (!id) {
			id = idName + idNum;
			idNum++;
		}

		items[id] = {
			id: id,
			element: element
		}

		element.addEventListener('click', function(e) {

			dispatcher.dispatch({
				type: 'scroll-to',
				speed: 0.3,
				position: 0
			});

			if (home) {
				setTimeout(function() {
					dispatcher.dispatch({
						type: 'first-scroll-deactivale'
					});
				}, 300);
			}
		});
	}

	var _remove = function(items, item) {
		delete items[item.id];
	}

	var _handleMutate = function() {
		var elements;

		var check = function(items, element) {
			var found = false;
			for (var id in items) {
				if (items.hasOwnProperty(id)) {
					if (items[id].element === element) {
						found = true;
						break;
					}
				}
			}
			if (!found) {
				_add(items, element);
			}
		}

		var backCheck = function(items, elements, item) {
			var element = item.element;
			var found   = false;

			for (var i = 0; i < elements.length; i++) {
				if (elements[i] === item.element) {
					found = true;
					break;
				}
			}

			if (!found) {
				_remove(items, item);
			}
		}

		home = document.getElementsByClassName('home')[0];
		elements = document.getElementsByClassName('top-scroll');
		for (var i = 0; i < elements.length; i++) {
			check(items, elements[i]);
		}
		for (var id in items) {
			if (items.hasOwnProperty(id)) {
				backCheck(items, elements, items[id]);
			}
		}
	}

	var init = function() {
		_handleMutate();

		dispatcher.subscribe(function(e) {
			if (e.type === 'mutate') {
				_handleMutate();
			}
		});
	}

	return {
		init: init
	}
});