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
		// var translate = function(element, position, opacity, speed) {
		// 	element.style.transitionDuration = speed + 'ms';
		// 	element.style.opacity = opacity;
		// 	element.style.transform = 'translateY(' + position + 'px) translateZ(0)';
		// }

		var anim = {
			t12: function(component) {
				var arrow = component.getElementsByClassName('arrow')[0];
				var lamp  = component.getElementsByClassName('lamp')[0];
				var lampInner = component.getElementsByClassName('lamp-inner')[0];
				var photoContainer = component.getElementsByClassName('photo')[0];
				var topPhoto  = component.getElementsByClassName('top-photo')[0];
				var t1 = new TimelineLite();
				var t2 = new TimelineLite();
				var t3 = new TimelineLite();

				arrow.style.transition = 'none';
				lamp.style.transition = 'none';
				photoContainer.style.transition = 'none';

				TweenMax.killTweensOf(arrow);
				TweenMax.killTweensOf(lamp);
				TweenMax.killTweensOf(lampInner);
				TweenMax.killTweensOf(photoContainer);
				TweenMax.killTweensOf(topPhoto);

				TweenMax.set(arrow, {
					x: 0,
					y: 0,
					opacity: 1
				});
				TweenMax.set(lampInner, {
					x: 0,
					y: -550,
				});
				TweenMax.set(photoContainer, {
					x: 0,
					y: 0,
				});
				TweenMax.set(topPhoto, {
					rotation: '0deg'
				});
				TweenMax.set(lamp, {
					rotation: '0deg'
				});


				t1.to(arrow, 0.3, {
					x: 30,
					y: -2,
					opacity: 0,
					ease: Sine.easeIn
				}).to(lampInner, 0.3, {
					y: 0,
					ease: Sine.easeIn
				}, '-=0.1').to(lampInner, 0.1, {
					y: -10,
					ease: Circ.easeOut
				}).to(lampInner, 0.1, {
					y: 0,
					ease: Sine.easeIn
				}).to(lampInner, 0.05, {
					y: -3,
					ease: Circ.easeOut
				}).to(lampInner, 0.05, {
					y: 0,
					ease: Sine.easeIn
				});

				t2.to(lamp, 0.8, {
					rotation: '3deg',
					ease: Sine.easeInOut
				}).to(lamp, 0.8, {
					rotation: '-1.7deg',
					ease: Sine.easeInOut
				}).to(lamp, 0.8, {
					rotation: '1deg',
					ease: Sine.easeInOut
				}).to(lamp, 0.8, {
					rotation: '-0.5deg',
					ease: Sine.easeInOut
				}).to(lamp, 0.8, {
					rotation: '0.2deg',
					ease: Sine.easeInOut
				}).to(lamp, 0.8, {
					rotation: '0deg',
					ease: Sine.easeInOut
				});

				t3.to(photoContainer, 1, {
					y: 110,
					x: 10
				}).to(topPhoto, 0.2, {
					rotation: '30deg'
				}, '+=0.5');

				// translate(arrow, );
				// translate(lamp);
			},
			t13: function() {

			},
			t14: function() {

			},
			t21: function(component) {
				var arrow = component.getElementsByClassName('arrow')[0];
				var lamp  = component.getElementsByClassName('lamp')[0];
				var lampInner = component.getElementsByClassName('lamp-inner')[0];
				var photoContainer = component.getElementsByClassName('photo')[0];
				var topPhoto  = component.getElementsByClassName('top-photo')[0];
				var t1 = new TimelineLite();
				var t2 = new TimelineLite();
				arrow.style.transition = 'none';
				lamp.style.transition = 'none';

				TweenMax.killTweensOf(arrow);
				TweenMax.killTweensOf(lamp);
				TweenMax.killTweensOf(lampInner);
				TweenMax.killTweensOf(photoContainer);
				TweenMax.killTweensOf(topPhoto);


				TweenMax.set(arrow, {
					x: -10,
					y: 0,
					opacity: 0
				});

				t1.to(lampInner, 0.3, {
					x: 0,
					y: -550,
				}).to(arrow, 0.2, {
					x: 0,
					y: 0,
					opacity: 1
				});

				t2.to(photoContainer, 0.4, {
					x: 0,
					y: 0
				}).to(topPhoto, 0.2, {
					rotation: '0deg',
					ease: Sine.easeInOut
				}, '-=0.4');
			},
			t23: function() {

			},
			t24: function() {

			},
			t31: function() {

			},
			t32: function() {

			},
			t34: function() {

			}
		}

		var resolve = function() {
			var current = this._currentSlide;
			var next = slideStore.getData().items['main-slide-scroll'].index;

			this._currentSlide = next;

			console.log(current, next);

			if (current === 0 && next === 1) {
				anim.t12(this);
			}
			if (current === 1 && next === 0) {
				anim.t21(this);
			}
		}

		var createdCallback = function() {
			this._resolve = resolve.bind(this);
		}
		var attachedCallback = function() {
			this._currentSlide = slideStore.getData().items['main-slide-scroll'].index;

			slideStore.eventEmitter.subscribe(this._resolve);
		}
		var detachedCallback = function() {
			slideStore.eventEmitter.unsubscribe(this._resolve);
		}


		return {
			createdCallback: createdCallback,
			attachedCallback: attachedCallback,
			detachedCallback: detachedCallback
		}
	}();


	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('stage-component', {
		prototype: elementProto
	});
});