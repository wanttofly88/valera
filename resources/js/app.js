"use strict";

var path;
var pathElements =  document.getElementsByName('resources-path');
if (pathElements && pathElements.length) {
	path = pathElements[0].content;
} else {
	path = document.getElementsByTagName('head')[0].getAttribute('data-path');
}

if (path.slice(-1) !== '/') path += '/';

require.config({
	baseUrl: path + 'js/modules',
	paths: {
		bezier: '../libs/bezier-easing',
		TweenMax: '../libs/TweenMax',
	},
	shim: {
		bezier: {
			exports: 'bezier'
		}
	}
});


require([
	'resize/vh-fix.component',
	'resize/contain-resize.component',
	'preload/preload.component',
	'preload/img-preload.component',
	'full-text/full-text.component',
	'slide-scroll/slide-scroll.component',
	'full-bg/full-bg.component',
	'main-nav/main-nav.component',
	'stage/stage.component'
]);