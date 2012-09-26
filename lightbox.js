/*
**** UTILITIES ****
*/

var sdotUtilities = {
	addEvent: (function() {
		if (typeof addEventListener === 'function') {
			return function( el, evt, fn) {
				el.addEventListener(evt, fn, false);
			};
		} else if ( typeof attachEvent !== 'undefined' ) {
			return function(el, evt, fn) {
				el.attachEvent('on' + evt, fn);
			};
		} else {
			el['on' + evt] = fn;
		}
	})(),

	removeEvent: (function() {
		if (typeof removeEventListener === 'function') {
			return function( el, evt, fn) {
				el.removeEventListener(evt, fn, false);
			};
		} else if ( typeof detachEvent !== 'undefined' ) {
			return function(el, evt, fn) {
				el.detachEvent('on' + evt, fn);
			};
		} else {
			el['on' + evt] = null;
		}
	})(),

	getTarget: function(e) {
		if (typeof e.target !== 'undefined') {
			return e.target;
		} else if ( typeof window.event !== 'undefined') {
			return e.srcElement;
		}
	},

	preventDefault: function(e) {
		if ( typeof e.preventDefault !== 'undefined' ) {
			e.preventDefault();
		} else {
			e.returnValue = false;
		}
	},

	getScrollPos: function() {
		if ( typeof window.scrollY !== 'undefined') {
			return window.scrollY;
		} else {
			return document.documentElement.scrollTop;
		}
	},

	getWindowSize: function() {
		if (typeof window.innerWidth !== 'undefined') {
			return { windowWidth: window.innerWidth, windowHeight: window.innerHeight };
		} else if ( typeof document.body.offsetWidth !== 'undefined' ) {
			return { windowWidth: document.documentElement.clientWidth, windowHeight: document.documentElement.clientHeight };
		}
	},

	//to optimize (only one call to affect the function)
	stopPropagation: function(e) {
		if (typeof e.stopPropagation !== 'undefined') {
			return (function(e) {
				e.stopPropagation();
			})(e);
		} else {
			return (function() {
				window.event.cancelBubble = true; 
			})();
		}
	},

	isInPosArray: function(val, arr) {
		var l = arr.length;
		for (var i = 0; i < l; i++) {
			if (arr[i] == val) {
				return i;
			}
		}
		return -1;
	}
};

/*
**** LIGHTBOX ****
*/

var sdotLightbox = {
	init: function( config ) {
		this.container = config.container;
		this.links = this.container.getElementsByTagName('a'),
		this.l = this.links.length; //used for array creation
		this.imgResized = false,
		//real image size of the current img
		this.realH,
		this.realW,
		this.loadingImg = config.loadingImg;
		this.currentPos = 0; // start position (for navigation), arbitrary value.
		this.allImgs = []; //array of imgs (for navigation button)
		this.allTitles = []; //array of alt attributes for title img
		for (var i = 0; i < this.l; i++) {
			if ( this.links[i].getAttribute('rel') === 'lightbox') {
				if (this.links[i].getAttribute('data-img') !== null) {
					this.allImgs.push(this.links[i].getAttribute('data-img'));
					this.allTitles.push(this.links[i].getAttribute('alt'));
				} else {
					var src = this.links[i].children[0].src;
					// var fn = src.slice(src.lastIndexOf('/') + 1);
					this.allImgs.push(src);
					this.allTitles.push(this.links[i].children[0].getAttribute('alt'));
				}
			}
		}

		this.numImgs = this.allImgs.length;
		this.screenH;
		this.screenW;
		this.elImg; //current img in popup (as html element)
		this.elWrapper; // the black screen
		this.titleBody;

		sdotUtilities.addEvent(this.container, 'click', this.popupInit);
	},
	
	hideImg: function(elImg) {
		var elZoom = document.getElementById('zoom'),
			elBody = document.body;
		sdotUtilities.removeEvent(document.body, 'keyup', removeEventKey);
		sdotUtilities.removeEvent(sdotLightbox.elWrapper, 'click', removeWrapper);
		if (sdotLightbox.imgResized && elZoom) {
			sdotUtilities.removeEvent(elZoom, 'click', zoomEvent);
		}
		sdotUtilities.removeEvent(document.getElementById('leftArrow'), 'click', leftArrowEvent);
		sdotUtilities.removeEvent(document.getElementById('rightArrow'), 'click', rightArrowEvent);
		elBody.removeChild(sdotLightbox.elWrapper);
		elBody.style.overflow = 'visible';
		sdotUtilities.removeEvent(elImg, 'load', imgLoaded);
		sdotLightbox.elWrapper = null;
	},

	resizeImg: function( elImg ) {
		sdotLightbox.realW = elImg.width;
		sdotLightbox.realH = elImg.height;
		var propH = sdotLightbox.realH / sdotLightbox.screenH, //proportion y
			propW = sdotLightbox.realW / sdotLightbox.screenW,	//proportion x
			resultProp = (propW > propH) ? true : false; //greater proportion

		//Resize image if needed
		if (sdotLightbox.realW > sdotLightbox.screenW || sdotLightbox.realH > sdotLightbox.screenH) {
			sdotLightbox.imgResized = true;
			if (sdotLightbox.realW > sdotLightbox.realH) {
				if (resultProp) {
					elImg.width = sdotLightbox.screenW - 40;
					elImg.height = (elImg.width * elImg.height) / sdotLightbox.realW;
				} else if (!resultProp) {
					elImg.height = sdotLightbox.screenH - 40;
					elImg.width = (elImg.width * elImg.height) / sdotLightbox.realH;
				}
			} else if (sdotLightbox.realH > sdotLightbox.realW) {
				if (!resultProp) {
					elImg.height = sdotLightbox.screenH - 40;
					elImg.width = (elImg.width * elImg.height) / sdotLightbox.realH;
				} else {
					elImg.width = sdotLightbox.screenW - 40;
					elImg.height = (elImg.width * elImg.height) / sdotLightbox.realW ;
				}
			}
		} else {
			sdotLightbox.imgResized = false;
		}

		return { h: elImg.height, w: elImg.width };
	},

	createArrow: function(id, img, top, left, dir) {
			var el = sdotLightbox.createElement({
				id: id,
				tag: 'img',
				img: img,
				styles: {
					top: top,
					left: left,
					boxShadow: 'none',
					cursor: 'pointer',
					position: 'absolute',
					zIndex: '101'
				},
				customAttr: { attr: 'data-dir', val: dir },
				append: sdotLightbox.elWrapper
			});

			return el;
	},

	navCreation: function(sizes) {
		var scrollPos = sdotUtilities.getScrollPos(),
			self = sdotLightbox;

		var elLeftArrow = this.createArrow(
			'leftArrow', 'img/arrow_right.png',
			(scrollPos + self.screenH / 2) + 'px',
			(self.screenW / 2 - sizes.w / 2 - 24) + 'px',
			'prev');

		sdotUtilities.addEvent(elLeftArrow, 'click', leftArrowEvent = function(e) {
			self.nextImg(self.getNewImgSrc(--self.currentPos));
			sdotUtilities.stopPropagation(e);
		});

		var elRightArrow = this.createArrow(
			'rightArrow', 'img/arrow_left.png',
			(scrollPos + self.screenH / 2) + 'px',
			(self.screenW / 2 + sizes.w / 2 - 15) + 'px',
			'next');

		sdotUtilities.addEvent(elRightArrow, 'click', rightArrowEvent = function(e) {
			self.nextImg(self.getNewImgSrc(++self.currentPos));
			sdotUtilities.stopPropagation(e);
		});

		if (self.imgResized) {
			this.createZoomBtn(scrollPos, sizes, elRightArrow, elLeftArrow);
		}

		//the title body
		self.titleBody = self.createElement({
			tag: 'div', id: 'img-title', className: 'img-title', styles: {
				top: (scrollPos + sdotLightbox.screenH / 2 - sizes.h / 2) + 'px',
				left: (sdotLightbox.screenW / 2 - sizes.w / 2) + 'px',
				width: (sizes.w - 24) + 'px' //substracte padding
			}
		});
		self.titleBody.innerHTML = self.allTitles[self.currentPos];
	},

	createZoomBtn: function(scrollPos, sizes, elRightArrow, elLeftArrow) {
		var zoomImg = sdotLightbox.createElement({
			id: 'zoom',
			tag: 'div',
			// img: 'img/zoom.png',
			styles: {
				top: (scrollPos + sdotLightbox.screenH / 2 - sizes.h / 2 - 12) + 'px',
				left: (sdotLightbox.screenW / 2 + sizes.w / 2 - 10) + 'px',
				boxShadow: 'none',
				cursor: 'pointer',
				position: 'absolute',
				zIndex: '101'
			},
			append: sdotLightbox.elWrapper
		});

		sdotUtilities.addEvent(zoomImg, 'click', zoomEvent = function(e) {
			var self = sdotLightbox,
				elImg = self.elImg;

			elImg.width = self.realW;
			elImg.height = self.realH;
			elImg.style.top = sdotUtilities.getScrollPos() + 'px';
			if ( elImg.width > self.screenW ) {
				elImg.style.left = 0;
			} else {
				elImg.style.left = (self.screenW / 2 - elImg.width / 2) + 'px';
			}
			elRightArrow.style.display = 'none';
			elLeftArrow.style.display = 'none';
			self.titleBody.style.display = 'none';
			zoomImg.style.display = 'none';
			document.body.style.overflow = 'visible';
			sdotUtilities.stopPropagation(e);
		});
	},

	moveNav: function(sizes) {
		var elLeftArrow = document.getElementById('leftArrow'),
			elRightArrow = document.getElementById('rightArrow'),
			elZoom = document.getElementById('zoom'),
			scrollPos = sdotUtilities.getScrollPos();

		if (sdotLightbox.imgResized && elZoom) {
			elZoom.style.top = (scrollPos + sdotLightbox.screenH / 2 - sizes.h / 2 - 12) + 'px';
			elZoom.style.left = (sdotLightbox.screenW / 2 + sizes.w / 2 - 10) + 'px';
		} else if ( sdotLightbox.imgResized && elZoom === null) {
			this.createZoomBtn(scrollPos, sizes, elRightArrow, elLeftArrow);
		} else if ( sdotLightbox.imgResized === false && elZoom ) {
			sdotUtilities.removeEvent(elZoom, 'click', zoomEvent);
			sdotLightbox.elWrapper.removeChild(elZoom);
		}
		
		elLeftArrow.style.left = (sdotLightbox.screenW / 2 - sizes.w / 2 - 24) + 'px';
		elRightArrow.style.left = (sdotLightbox.screenW / 2 + sizes.w / 2 - 15) + 'px';

		sdotLightbox.titleBody.style.top = (scrollPos + sdotLightbox.screenH / 2 - sizes.h / 2) + 'px';
		sdotLightbox.titleBody.style.left = (sdotLightbox.screenW / 2 - sizes.w / 2) + 'px';
		sdotLightbox.titleBody.style.width = (sizes.w - 24) + 'px'; //substracte padding
	},

	createElement: function( obj ) { //tag id img
		var el = document.createElement(obj.tag);
		obj.id && (el.id = obj.id);
		obj.img && (el.src = obj.img);
		obj.customAttr && el.setAttribute(obj.customAttr.attr, obj.customAttr.val);
		obj.className && (el.className = obj.className);
		if (obj.styles && typeof obj.styles === 'object') {
			for (prop in obj.styles) {
				if (obj.styles.hasOwnProperty(prop)) {
					el.style[prop] = obj.styles[prop];
				}
			}
		}

		obj.append && obj.append.appendChild(el);

		return el;
	},

	imgLoading: function( elLoader ) {
		var elImg = sdotLightbox.elImg,
			sizes = sdotLightbox.resizeImg(elImg),
			scrollPos = sdotUtilities.getScrollPos();	

		elImg.style.top = (sdotLightbox.screenH / 2 - sizes.h / 2 + scrollPos) + 'px';
		elImg.style.left = (sdotLightbox.screenW / 2 - sizes.w / 2) + 'px';
		sdotLightbox.elWrapper.replaceChild(elImg, elLoader);

		return sizes;
	},

	nextImg: function(imgLoad, createNav) {
		sdotLightbox.screenW = sdotUtilities.getWindowSize().windowWidth;
		sdotLightbox.screenH = sdotUtilities.getWindowSize().windowHeight;
		var self = sdotLightbox;

		self.elImg = self.createElement({tag: 'img', id: 'currentImg'});

		var elLoader = self.createElement({
			tag: 'img', id: 'loading', img: self.loadingImg, styles: {
				top: (sdotLightbox.screenH / 2 - 50 + sdotUtilities.getScrollPos()) + 'px',
				left: (sdotLightbox.screenW / 2 - 50) + 'px',
				position: 'absolute',
				zIndex: '101'
			},
			append: sdotLightbox.elWrapper
		});

		sdotUtilities.addEvent(sdotLightbox.elImg, 'load', imgLoaded = function () {
			if (!createNav) {
				sdotLightbox.elWrapper.replaceChild(elLoader, document.getElementById('currentImg'));
			}
			var sizes = self.imgLoading(elLoader);
			if (createNav) {
				sdotLightbox.navCreation(sizes);
			} else {
				sdotLightbox.moveNav(sizes);
				self.titleBody.innerHTML = self.allTitles[self.currentPos];
			}
			sdotLightbox.elWrapper.appendChild(sdotLightbox.titleBody);
		});

		// added after the event load image, if not, ie7 will not display the image
		sdotLightbox.elImg.src = imgLoad;
	},

	getNewImgSrc: function(pos) {
		//loop gallery
		if ( pos < 0) { this.currentPos = this.numImgs - 1; }
		else if ( pos > this.numImgs - 1 ) { this.currentPos = 0; }
		return this.allImgs[this.currentPos].replace('_thumb', '');
	},

	keyNavigation: function(e) {
		var self = sdotLightbox,
			key = e.keyCode;
		console.log(e.keyCode);
		if (key === 37) {
			self.nextImg(self.getNewImgSrc(--self.currentPos));
		} else if (key === 39) {
			self.nextImg(self.getNewImgSrc(++self.currentPos));
		} else if (e.keyCode === 27) {
			self.hideImg(self.elImg);
			console.log('ok');
		}
	},

	popupInit: function(e) {
		var self = sdotLightbox,
			target = sdotUtilities.getTarget(e);	

		/* 	check if either:
			- the parent node is not A with rel=lightbox 
			- or if the current node is not A with rel=lightbox */
		if (target.parentNode.getAttribute('rel') !== 'lightbox') {
			if ( !(target.tagName === 'A' && target.getAttribute('rel') === 'lightbox') ) {
				return false;
			}
		}

		if (target.getAttribute('data-img') !== null) {
			self.currentPos = sdotUtilities.isInPosArray(target.getAttribute('data-img'), self.allImgs);
		} else {
			self.currentPos = sdotUtilities.isInPosArray(target.src, self.allImgs);
		}

		// Has to be executed before calculating screen width/height
		document.body.style.overflow = 'hidden';	

		self.elWrapper = self.createElement({
			tag: 'div', className: 'wrapper', id: 'wrapper', styles: { top: 0 },
			append: document.body
		});

		self.nextImg(self.getNewImgSrc(self.currentPos), true);

		sdotUtilities.addEvent.call(self.elWrapper, self.elWrapper, 'click', removeWrapper = function() {
			self.hideImg(self.elImg);
		});

		sdotUtilities.addEvent(document.body, 'keyup', removeEventKey = self.keyNavigation);

		sdotUtilities.preventDefault(e);
	}
};








