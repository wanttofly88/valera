define([
	'dispatcher',
	'slide-scroll/slide-scroll.store',
	'TweenMax'
], function(
	dispatcher,
	slideStore,
	TweenMax
) {
	"use strict";

	var elementProto = function() {
		var handleStore = function() {
			var slide = slideStore.getData().items['main-slide-scroll'].index;

			if (slide !== 1) {
				clearTimeout(this._timeout);
			} else {
				this._timeout = setTimeout(this._animate, 1500);
			}
		}

		var animate = function() {
			var num;

			var animateBird = function(bird) {
				var sp = Math.random()*3 + 3;
				var xDist =  Math.random()*350 + window.innerWidth + 200;
				var randCoef1 = Math.random() + 0.5;
				// var randCoef2 = Math.random()*1.5 + 3;
				var randCoef2 = Math.random()*2 + 0.2;
				var s1 = Math.random()*120 - 60;
				var s2 = Math.random()*120 - 60;
				var xCoef = Math.random()/2 + 0.75;
				var delayCoef = Math.random()/5;
				var t = {
					x: 0,
					r1: 1,
					r2: 1
				}
				//var y = -Math.pow((t.x*t.r1 + 400*t.r2), 2)/(900);

				if (!bird) return;

				TweenMax.set(bird, {
					x: t.x*xCoef + s1,
					y: -Math.pow((t.x*t.r1 + 400*t.r2), 2)/(1300),
					rotation: '-15deg',
					opacity: 1
				})

				TweenMax.to(t, sp, {
					x: -xDist,
					r1: randCoef1,
					r2: randCoef2,
					delay: delayCoef,
					onUpdate: function() {
						var y;
						y = -Math.pow((t.x*t.r1 + 400*t.r2), 2)/(1300);
						// y = (t.x*t.r1)/randCoef2;
						bird.style.transform = 
							'translateX(' + (t.x*xCoef) +'px) translateY(' + (y) +'px) translateZ(0px) rotate(-15deg) scale(' + t.r1 + ')'
					}
				});
				TweenMax.to(bird, 0.3, {
					opacity: 0,
					delay: sp - 0.3 + delayCoef,
					onComplete: function() {
						setTimeout(function() {
							bird.parentNode.removeChild(bird);
						}, 200);
					}
				});
			}

			var createBird = function(component) {
				var bird = document.createElement('div');
				bird.className = 'bird bird-1';
				component.appendChild(bird);
				component._birds.push(bird);
			}

			this._birds = [];
			num = 5;

			for (var i = 0; i < num; i++) {
				createBird(this);
			}

			Array.prototype.forEach.call(this._birds, animateBird)
		}

		var createdCallback = function() {
			this._animate = animate.bind(this);
			this._handleStore = handleStore.bind(this);
			this._timeout = false;
		}
		var attachedCallback = function() {
			this._birds = [];

			this._handleStore();
			slideStore.eventEmitter.subscribe(this._handleStore);
		}
		var detachedCallback = function() {
			slideStore.eventEmitter.unsubscribe(this._handleStore);
		}

		return {
			createdCallback: createdCallback,
			attachedCallback: attachedCallback,
			detachedCallback: detachedCallback
		}
	}();


	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('birds-component', {
		prototype: elementProto
	});
});