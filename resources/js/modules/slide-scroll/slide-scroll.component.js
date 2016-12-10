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

	var translate = function(element, position, speed) {
		element.style.transitionDuration = speed + 'ms';
		element.style.transform = 'translateY(' + position + 'px) translateZ(0)';
	}

	var elementProto = function() {
		var _mouseMoveHandler = function() {

		}

		var KeyboardHandler = function(component) {
			this.component = component;
			// prevent when zooming
		}

		var WheelHandler = function(component) {
			this.component = component;
			this._time = null;
			this._scrollBuffer = [];

			this.onWheel = function(e) {
				var value = e.wheelDelta || -e.deltaY || -e.detail;
				var direction = value > 0 ? 'top' : 'bottom';
				var previousTime;
				var summ1, summ2;

				if (this.component._isScrolling) return;

				if (Math.abs(e.wheelDeltaX) > Math.abs(e.wheelDelta) || Math.abs(e.deltaX ) > Math.abs(e.deltaY)) return;

				if (this._scrollBuffer.length > 50) {
					this._scrollBuffer.shift();
				}

				previousTime = this._time;
				this._time = new Date().getTime();

				if (previousTime && this._time - previousTime > 200) {
					this._scrollBuffer = [];
				}

				this._scrollBuffer.push(Math.abs(value));

				summ1 = this._scrollBuffer.reduceRight(function(previousValue, currentValue, index, array) {
					return index < array.length - 10 ? previousValue : previousValue + currentValue;
				});
				summ2 = this._scrollBuffer.reduceRight(function(previousValue, currentValue, index, array) {
					return index < array.length - 50 ? previousValue : previousValue + currentValue;
				});

				if (summ1 >= summ2) {
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

				if (this._edge) {
					move = move / 4;
				}

				e.preventDefault();
				translate(this.component._wrapper, -this.index*this.wh + move , 0);

			}.bind(this);

			this.ontouchend =  function(e) {
				var duration = +new Date - this._start.time;
				var check = parseInt(duration) < 250 && Math.abs(this._delta.y) > 20 || Math.abs(this._delta.y) > 100;
				var returnSpeed = 250;

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
			}, 200);

			translate(this._wrapper, -wh*storeData.index, 400);
		}

		var resizeHandler = function() {
			var storeData = store.getData().items[this._id];
			var wh = window.innerHeight;

			if (!storeData) {
				console.warn('slide-scroll internall error');
				return;
			}

			if (this.clientHeight !== wh) {
				this.style.height = window.innerHeight + 'px';
			}
			
			translate(this._wrapper, -wh*storeData.index, 0);
		}

		var createdCallback = function() {
			this._storeHandler  = storeHandler.bind(this);
			this._resizeHandler = resizeHandler.bind(this);
			this._touchHandler  = new TouchHandler(this);
			this._wheelHandler  = new WheelHandler(this);
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
			window.addEventListener('resize', this._resizeHandler);
		}
		var detachedCallback = function() {
			store.eventEmitter.unsubscribe(this._handleStore);
			this._touchHandler.remove();
			this._wheelHandler.remove();
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