define(['dispatcher', 'resize/resize.store', 'resize/breakpoint.store'], function(dispatcher, store, bpStore) {

	"use strict";

	var main;
	var footer;
	var header;
	var contacts = false;

	var _handleChange = function() {
		var storeData = store.getData();
		var bpData = bpStore.getData();
		var shift = 0;
		var footerHeight;
		var headerHeight;
		if (contacts) shift = 0;

		footerHeight = footer ? footer.clientHeight : 0;
		headerHeight = header ? header.clientHeight : 0;

		if (bpData.breakpoint.name === 'desktop') {
			main.style.minHeight = (storeData.height - footerHeight - shift) + 'px';
		} else {
			main.style.minHeight = (storeData.height - footerHeight - headerHeight - shift) + 'px';
		}

		if (main.classList.contains('p404')) {
			main.style.height = storeData.height + 'px';
		}
	}

	var _handleMutate = function() {
		main   = document.getElementsByTagName('main')[0];
		footer = document.getElementsByTagName('footer')[0];
		header = document.getElementsByTagName('header')[0];
		contacts = document.getElementsByClassName('contacts-page')[0];
	}

	var init = function() {
		_handleMutate();
		_handleChange();

		store.eventEmitter.subscribe(_handleChange);

	}

	return {
		init: init
	}
});