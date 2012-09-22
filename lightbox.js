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

	//to optimize (only on call to affect the function)
	stopPropagation: function(e) {
		if (typeof e.stopPropagation !== 'undefined') {
			e.stopPropagation();
		} else {
			window.event.cancelBubble = true; 
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
		this.l = this.links.length;
		this.imgResized = false,
		//real image size of the current img
		this.realH,
		this.realW,
		this.loadingImg = config.loadingImg;
		this.currentPos = 0; // start position (for navigation), arbitrary value.
		this.allImgs = []; //array of imgs (for navigation button)
		for (var i = 0; i < this.l; i++) {
			if ( this.links[i].getAttribute('rel') === 'lightbox') {
				if (this.links[i].getAttribute('data-img') !== null) {
					this.allImgs.push(this.links[i].getAttribute('data-img'));
				} else {
					var src = this.links[i].children[0].src;
					// var fn = src.slice(src.lastIndexOf('/') + 1);
					this.allImgs.push(src);
				}
			}
		}
		this.numImgs = this.allImgs.length;
		this.screenH;
		this.screenW;
		this.elImg; //current img in popup (as html element)
		this.elWrapper;

		sdotUtilities.addEvent(this.container, 'click', this.popupInit);
	},
	
	hideImg: function(elImg) {
		sdotUtilities.removeEvent(document.getElementById('wrapper'), 'click', removeWrapper);
		if (sdotLightbox.imgResized && document.getElementById('zoom')) {
			sdotUtilities.removeEvent(document.getElementById('zoom'), 'click', zoomEvent);
		}
		sdotUtilities.removeEvent(document.getElementById('leftArrow'), 'click', leftArrowEvent);
		sdotUtilities.removeEvent(document.getElementById('rightArrow'), 'click', rightArrowEvent);
		document.body.removeChild(document.getElementById('wrapper'));
		document.body.style.overflow = 'visible';
		sdotUtilities.removeEvent(elImg, 'load', imgLoaded);
		sdotLightbox.elWrapper = null;
	},

	resizeImg: function( elImg ) {
		var imgW = elImg.width,
			imgH = elImg.height,
			propH = imgH / sdotLightbox.screenH, //proportion y
			propW = imgW / sdotLightbox.screenW,	//proportion x
			resultProp = (propW > propH) ? true : false; //greater proportion

		sdotLightbox.realH = imgH;
		sdotLightbox.realW = imgW;

		//Resize image if needed
		if (imgW > sdotLightbox.screenW || imgH > sdotLightbox.screenH) {
			sdotLightbox.imgResized = true;
			if (imgW > imgH) {
				if (resultProp) {
					elImg.width = sdotLightbox.screenW - 40;
					elImg.height = (elImg.width * elImg.height) / imgW;
				} else if (!resultProp) {
					elImg.height = sdotLightbox.screenH - 40;
					elImg.width = (elImg.width * elImg.height) / imgH;
				}
			} else if (imgH > imgW) {
				if (!resultProp) {
					elImg.height = sdotLightbox.screenH - 40;
					elImg.width = (elImg.width * elImg.height) / imgH;
				} else {
					elImg.width = sdotLightbox.screenW - 40;
					elImg.height = (elImg.width * elImg.height) / imgW ;
				}
			}
		} else {
			sdotLightbox.imgResized = false;
		}

		return { h: elImg.height, w: elImg.width };
	},

	navCreation: function(sizes) {
		var scrollPos = sdotUtilities.getScrollPos();

		var elLeftArrow = sdotLightbox.createElement({
			id: 'leftArrow',
			tag: 'img',
			img: 'img/arrow_right.png',
			styles: {
				top: (scrollPos + sdotLightbox.screenH / 2) + 'px',
				left: (sdotLightbox.screenW / 2 - sizes.w / 2 - 24) + 'px',
				boxShadow: 'none',
				cursor: 'pointer',
				position: 'absolute',
				zIndex: '101'
			},
			customAttr: { attr: 'data-dir', val: 'prev' },
			append: sdotLightbox.elWrapper
		});

		sdotUtilities.addEvent(elLeftArrow, 'click', leftArrowEvent = function(e) {
			sdotLightbox.nextImg(sdotLightbox.getNewImgSrc(--sdotLightbox.currentPos));
			sdotUtilities.stopPropagation(e);
		});

		var elRightArrow = sdotLightbox.createElement({
			id: 'rightArrow',
			tag: 'img',
			img: 'img/arrow_left.png',
			styles: {
				top: (scrollPos + sdotLightbox.screenH / 2) + 'px',
				left: (sdotLightbox.screenW / 2 + sizes.w / 2 - 15) + 'px',
				boxShadow: 'none',
				cursor: 'pointer',
				position: 'absolute',
				zIndex: '101'
			},
			customAttr: { attr: 'data-dir', val: 'next' },
			append: sdotLightbox.elWrapper
		});

		sdotUtilities.addEvent(elRightArrow, 'click', rightArrowEvent = function(e) {
			console.log('next');
			//Au lieu d'appeller hideimg qui efface tout rrewrite the function
			//to del only buttons and img, not the wrapper.
			// sdotLightbox.hideImg(elImg);
			sdotLightbox.nextImg(sdotLightbox.getNewImgSrc(++sdotLightbox.currentPos));
			//IL FAUT Repositionnerles éléments de navigation et ne pas faire de duplicata
			sdotUtilities.stopPropagation(e);
		});

		if (sdotLightbox.imgResized) {
			var zoomImg = sdotLightbox.createElement({
				id: 'zoom',
				tag: 'img',
				img: 'img/zoom.png',
				styles: {
					top: (scrollPos + sdotLightbox.screenH / 2 - sizes.h / 2 - 20) + 'px',
					left: (sdotLightbox.screenW / 2 + sizes.w / 2 - 15) + 'px',
					boxShadow: 'none',
					cursor: 'pointer',
					position: 'absolute',
					zIndex: '101'
				},
				append: sdotLightbox.elWrapper
			});

			sdotUtilities.addEvent(zoomImg, 'click', zoomEvent = function(e) {
				elImg = sdotLightbox.elImg;
				elImg.width = sdotLightbox.realW;
				elImg.height = sdotLightbox.realH;
				elImg.style.top = sdotUtilities.getScrollPos() + 'px';
				if ( elImg.width > sdotLightbox.screenW ) {
					elImg.style.left = 0;
				} else {
					elImg.style.left = (sdotLightbox.screenW / 2 - elImg.width / 2) + 'px';
				}
				elRightArrow.style.display = 'none';
				elLeftArrow.style.display = 'none';
				zoomImg.style.display = 'none';
				document.body.style.overflow = 'visible';
				sdotUtilities.stopPropagation(e);
			});
		}
	},

	moveArrow: function(sizes) {
		var leftArrow = document.getElementById('leftArrow'),
			rightArrow = document.getElementById('rightArrow'),
			scrollPos = sdotUtilities.getScrollPos();

		//OPTIMIZATION NEEDED

		if (sdotLightbox.imgResized && document.getElementById('zoom')) {
			console.log('move');
			document.getElementById('zoom').style.top = (scrollPos + sdotLightbox.screenH / 2 - sizes.h / 2 - 20) + 'px';
			document.getElementById('zoom').style.left = (sdotLightbox.screenW / 2 + sizes.w / 2 - 15) + 'px';
		} else if ( sdotLightbox.imgResized && document.getElementById('zoom') === null) {
			console.log('create');
			var zoomImg = sdotLightbox.createElement({
				id: 'zoom',
				tag: 'img',
				img: 'img/zoom.png',
				styles: {
					top: (scrollPos + sdotLightbox.screenH / 2 - sizes.h / 2 - 20) + 'px',
					left: (sdotLightbox.screenW / 2 + sizes.w / 2 - 15) + 'px',
					boxShadow: 'none',
					cursor: 'pointer',
					position: 'absolute',
					zIndex: '101'
				},
				append: sdotLightbox.elWrapper
			});

			sdotUtilities.addEvent(zoomImg, 'click', zoomEvent = function(e) {
				elImg = sdotLightbox.elImg;
				elImg.width = sdotLightbox.realW;
				elImg.height = sdotLightbox.realH;
				elImg.style.top = sdotUtilities.getScrollPos() + 'px';
				if ( elImg.width > sdotLightbox.screenW ) {
					elImg.style.left = 0;
				} else {
					elImg.style.left = (sdotLightbox.screenW / 2 - elImg.width / 2) + 'px';
				}
				rightArrow.style.display = 'none';
				leftArrow.style.display = 'none';
				zoomImg.style.display = 'none';
				document.body.style.overflow = 'visible';
				sdotUtilities.stopPropagation(e);
			});
		} else if ( sdotLightbox.imgResized === false && document.getElementById('zoom') ) {
			console.log('remove');
			sdotUtilities.removeEvent(document.getElementById('zoom'), 'click', zoomEvent);
			document.getElementById('wrapper').removeChild(document.getElementById('zoom'));
		}
		
		leftArrow.style.left = (sdotLightbox.screenW / 2 - sizes.w / 2 - 24) + 'px';
		rightArrow.style.left = (sdotLightbox.screenW / 2 + sizes.w / 2 - 15) + 'px';
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
		var elImg = sdotLightbox.elImg;
		var sizes = sdotLightbox.resizeImg(elImg),
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

		// document.createElement('img');

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
				sdotLightbox.moveArrow(sizes);
				//REEVALUER LE BOUTON DE ZOOM
				//REPOSITIONNER LES FLECHES ET BOUTON DE ZOOM SI NECESSAIRE
				//Syndé le navCreation ?
			}
		});

		// added after the event load image, if not, ie7 will not display the image
		sdotLightbox.elImg.src = imgLoad;
	},

	getNewImgSrc: function(pos) {
		return sdotLightbox.allImgs[sdotLightbox.currentPos].replace('_thumb', '');
	},

	popupInit: function(e) {
		var self = sdotLightbox,
			target = sdotUtilities.getTarget(e);	

		/* 	check if either:
			- the parent node is not A with rel=lightbox 
			- or if the current node is not A with rel=lightbox */
		if (!target.parentNode.getAttribute('rel')
			|| 	target.parentNode.getAttribute('rel') !== 'lightbox' ) {
			if ( !(target.tagName === 'A' && target.getAttribute('rel') === 'lightbox') )
			return false;
		}

		if (target.getAttribute('data-img') !== null) {
			sdotLightbox.currentPos = sdotUtilities.isInPosArray(target.getAttribute('data-img'), sdotLightbox.allImgs);
			var imgLoad = sdotLightbox.getNewImgSrc(sdotLightbox.currentPos);
		} else {
			sdotLightbox.currentPos = sdotUtilities.isInPosArray(target.src, sdotLightbox.allImgs);
			var imgLoad = sdotLightbox.getNewImgSrc(sdotLightbox.currentPos);
		}

		// Has to be executed before calculating screen width/height
		document.body.style.overflow = 'hidden';	

		// if (target.id !== 'leftArrow' && target.id !== 'rightArrow') {
		sdotLightbox.elWrapper = self.createElement({
			tag: 'div', className: 'wrapper', id: 'wrapper', styles: { top: 0 },
			append: document.body
		});

		sdotLightbox.nextImg(imgLoad, true);

		sdotUtilities.addEvent.call(sdotLightbox.elWrapper, sdotLightbox.elWrapper, 'click', removeWrapper = function() {
			self.hideImg(sdotLightbox.elImg);
		});

		sdotUtilities.preventDefault(e);
	}
};








