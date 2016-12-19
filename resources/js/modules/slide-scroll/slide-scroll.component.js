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

		var KeyboardHandler = function(component) {
			this.component = component;

			this.onKeyDown = function(e) {
				var keyCode = e.which;

				if (keyCode === 17) {
					this.component._ctrl = true;
				}

				if (this.component._isScrolling) return;

				if (keyCode === 38 || keyCode === 33) {
					dispatcher.dispatch({
						type: 'slide-scroll',
						id: this.component._id,
						direction: 'top'
					});
				} else if (keyCode === 40 || keyCode === 34) {
					dispatcher.dispatch({
						type: 'slide-scroll',
						id: this.component._id,
						direction: 'bottom'
					});
				}
			}.bind(this);

			this.onKeyUp = function() {
				this.component._ctrl = false;
			}.bind(this);

			this.set = function() {
				document.addEventListener('keydown', this.onKeyDown);
				document.addEventListener('keyup', this.onKeyUp);
			}

			this.remove = function() {
				document.removeEventListener('keydown', this.onKeyDown);
				document.removeEventListener('keyup', this.onKeyUp);
			}
		}

		var WheelHandler = function(component) {
			this.component = component;
			this._time = null;

			this._resetBuffer = function() {
				this._scrollBuffer = [];
				for (var i = 0; i < 40; i++) {
					this._scrollBuffer.push(0);
				}
			}

			this._resetBuffer();

			this.onWheel = function(e) {
				var value = e.wheelDelta || -e.deltaY || -e.detail;
				var direction = value > 0 ? 'top' : 'bottom';
				var previousTime;
				var summ1, summ2;
				var bufferOld, bufferNew;

				if (this.component._ctrl) return;

				if (Math.abs(e.wheelDeltaX) > Math.abs(e.wheelDelta) || Math.abs(e.deltaX ) > Math.abs(e.deltaY)) return;

				previousTime = this._time;
				this._time = new Date().getTime();

				if (previousTime && this._time - previousTime > 200) {
					this._resetBuffer();
				}

				this._scrollBuffer.push(Math.abs(value));
				this._scrollBuffer.shift();

				if (this.component._isScrolling) return;

				bufferNew = this._scrollBuffer.slice(20, 40);
				bufferOld = this._scrollBuffer.slice(0, 20);

				summ1 = bufferNew.reduce(function(previousValue, currentValue) {
					return previousValue + currentValue;
				});
				summ2 = bufferOld.reduce(function(previousValue, currentValue) {
					return previousValue + currentValue;
				});

				summ1 = summ1/20;
				summ2 = summ2/20;

				if (summ1*0.7 >= summ2) {
					dispatcher.dispatch({
						type: 'slide-scroll',
						id: this.component._id,
						direction: direction
					});
				}
			}.bind(this);

			this.set = function() {
				document.addEventListener('mousewheel', this.onWheel);
				document.addEventListener('wheel', this.onWheel);
			}
			this.remove = function() {
				document.removeEventListener('mousewheel', this.onWheel);
				document.removeEventListener('wheel', this.onWheel);
			}
		}

		var TouchHandler = function(component) {
			this.component = component;
			this._start = {};
			this._delta = {};
			this._horizontal = undefined;
			this._edge = false;

			this.ontouchstart = function(e) {
				var touches = e.touches[0];
				var storeData = store.getData().items[this.component._id];

				this.wh = this.component.clientHeight;
				this.index = storeData.index;

				this._start = {
					x: touches.pageX,
					y: touches.pageY,
					time: +new Date
				}
				this._delta = {}
				this._horizontal = undefined;

				this.component.addEventListener('touchmove', this.ontouchmove);
				this.component.addEventListener('touchend',  this.ontouchend);

			}.bind(this);

			this.ontouchmove = function(e) {
				var touches;
				var move = 0;
				var touchMoveEvent;

				if (e.touches.length > 1 || e.scale && e.scale !== 1) return;
				touches = event.touches[0];

				this.touches = event.touches[0];

				this._delta = {
					x: this.touches.pageX - this._start.x,
					y: this.touches.pageY - this._start.y
				}

				if (typeof this._horizontal === undefined) {
					this._horizontal = !!(this._horizontal || Math.abs(this._delta.y) < Math.abs(this._delta.x));
				}

				if (this._horizontal) return;

				move = this._delta.y/3;

				if (this._delta.y > 0 && this.index <= 0) {
					this._edge = true;
				} else if (this._delta.y < 0 && this.index >= this.component._total - 1) {
					this._edge = true;
				} else {
					this._edge = false;
				}

				// if (this._edge) {
				// 	move = move / 4;
				// }
				if (this._edge) return;

				touchMoveEvent = new CustomEvent('touchshift', {
					'detail': move
				})
				this.component.dispatchEvent(touchMoveEvent);

				e.preventDefault();
				translate(this.component._wrapper, -this.index*this.wh + move , 0);

			}.bind(this);

			this.ontouchend =  function(e) {
				var duration = +new Date - this._start.time;
				var check = parseInt(duration) < 250 && Math.abs(this._delta.y) > 20 || Math.abs(this._delta.y) > 100;
				var returnSpeed = 250;
				var touchEndEvent;

				this.component.removeEventListener('touchmove', this.ontouchmove, false);
				this.component.removeEventListener('touchend',  this.ontouchend, false);

				if (this._horizontal) return;

				if (check && !this._edge) {
					dispatcher.dispatch({
						type: 'slide-scroll',
						id: this.component._id,
						direction: this._delta.y > 0 ? 'top' : 'bottom'
					});
				} else {
					if (this._edge) returnSpeed = 150;
					translate(this.component._wrapper, -this.index*this.wh , returnSpeed);
					touchEndEvent = new CustomEvent('touchcancel')
					this.component.dispatchEvent(touchEndEvent);
				}
			}.bind(this);

			this.set = function() {
				this.component.addEventListener('touchstart', this.ontouchstart);
			}

			this.remove = function() {
				this.component.removeEventListener('touchstart', this.ontouchstart);
			}
		}

		var storeHandler = function() {
			var storeData = store.getData().items[this._id];
			var wh = this.clientHeight;
			var self = this;

			this._isScrolling = true;
			setTimeout(function() {
				self._isScrolling = false;
			}, 300);

			translate(this._wrapper, -wh*storeData.index, 600);
		}

		var resizeHandler = function() {
			var storeData = store.getData().items[this._id];
			var wh = window.innerHeight;

			if (!storeData) {
				console.warn('slide-scroll internall error');
				return;
			}
			
			translate(this._wrapper, -wh*storeData.index, 0);
		}

		var createdCallback = function() {
			this._ctrl = false;
			this._storeHandler  = storeHandler.bind(this);
			this._resizeHandler = resizeHandler.bind(this);
			this._touchHandler  = new TouchHandler(this);
			this._wheelHandler  = new WheelHandler(this);
			this._keyboardHandler  = new KeyboardHandler(this);
		}

		var attachedCallback = function() {
			var slides = this.getElementsByClassName('js-slide');
			this._wrapper = this.getElementsByClassName('slide-scroll-wrapper')[0];
			this._id = this.getAttribute('data-id') || (idName + (idNum++));
			this._total = slides.length;
			this.setAttribute('data-id', this._id);

			dispatcher.dispatch({
				type: 'slide-scroll-add',
				id: this._id,
				index: 0,
				total: this._total
			});

			this._resizeHandler();

			store.eventEmitter.subscribe(this._storeHandler);
			this._touchHandler.set();
			this._wheelHandler.set();
			this._keyboardHandler.set();
			window.addEventListener('resize', this._resizeHandler);
		}

		var detachedCallback = function() {
			store.eventEmitter.unsubscribe(this._handleStore);
			this._touchHandler.remove();
			this._wheelHandler.remove();
			this._keyboardHandler.remove();
			window.removeEventListener('resize', this._resizeHandler);
		}


		return {
			createdCallback: createdCallback,
			attachedCallback: attachedCallback,
			detachedCallback: detachedCallback
		}
	}();


	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('slide-scroll', {
		prototype: elementProto
	});
});