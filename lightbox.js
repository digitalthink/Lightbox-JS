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
	}
};

/*
**** LIGHTBOX ****
*/

var sdotLightbox = {
	init: function( config ) {
		this.container = config.container;
		this.links = this.container.getElementsByTagName('a');
		this.loadingImg = config.loadingImg;

		sdotUtilities.addEvent(this.container, 'click', this.popupInit);
	},
	
	hideImg: function(elImg) {
		sdotUtilities.removeEvent(document.getElementById('wrapper'), 'click', hiddenCall);
		document.body.removeChild(document.getElementById('wrapper'));
		document.body.style.overflow = 'visible';
		sdotUtilities.removeEvent(elImg, 'load', hiddenCall2);
	},

	resizeImg: function( elImg, screenH, screenW ) {
		var imgW = elImg.width,
			imgH = elImg.height,
			propH = imgH / screenH, //proportion y
			propW = imgW / screenW,	//proportion x
			resultProp = (propW > propH) ? true : false; //greater proportion

		//Resize image if needed
		if (imgW > screenW || imgH > screenH) {
			if (imgW > imgH) {
				if (resultProp) {
					elImg.width = screenW - 40;
					elImg.height = (elImg.width * elImg.height) / imgW;
				} else if (!resultProp) {
					elImg.height = screenH - 40;
					elImg.width = (elImg.width * elImg.height) / imgH;
				}
			} else if (imgH > imgW) {
				if (!resultProp) {
					elImg.height = screenH - 40;
					elImg.width = (elImg.width * elImg.height) / imgH;
				} else {
					elImg.width = screenW - 40;
					elImg.height = (elImg.width * elImg.height) / imgW ;
				}
			}
		}

		return { h: elImg.height, w: elImg.width };
	},

	imgLoading: function( elImg, screenH, screenW, elWrapper, elLoader ) {
		var sizes = sdotLightbox.resizeImg(elImg, screenH, screenW);	

		elImg.style.top = (screenH / 2 - sizes.h / 2 + sdotUtilities.getScrollPos()) + 'px';
		elImg.style.left = (screenW / 2 - sizes.w / 2) + 'px';
		elWrapper.replaceChild(elImg, elLoader);
	},

	createElement: function() {

	},

	popupInit: function(e) {
		var self = sdotLightbox,
			target = sdotUtilities.getTarget(e);

		if ( !target.parentNode.getAttribute('rel') || target.parentNode.getAttribute('rel') !== 'lightbox' ) {
			return false;
		}

		//Execute before calculating screen width/height
		document.body.style.overflow = 'hidden';
		
		var imgFN = target.src, //get the thumb uri
			imgLoad = imgFN.replace('_thumb', ''), //img to load
			screenW = sdotUtilities.getWindowSize().windowWidth,
			screenH = sdotUtilities.getWindowSize().windowHeight,
			elWrapper = document.createElement('div'),
			elLoader = document.createElement('img'),
			elImg = document.createElement('img');

		elWrapper.className = 'wrapper';
		elWrapper.id = 'wrapper';
		elWrapper.style.top = '0';

		elLoader.id = 'loading';
		elLoader.src = self.loadingImg;

		elLoader.style.top = (screenH / 2 - 50 + sdotUtilities.getScrollPos()) + 'px';
		elLoader.style.left = (screenW / 2 - 50) + 'px';
		
		elLoader = elWrapper.appendChild(elLoader);
		elWrapper = document.body.appendChild(elWrapper);
		
		sdotUtilities.addEvent.call(elWrapper, elWrapper, 'click', hiddenCall = function() {
			self.hideImg(elImg);
		});

		sdotUtilities.addEvent(elImg, 'load', hiddenCall2 = function () {
			self.imgLoading(elImg, screenH, screenW, elWrapper, elLoader);
		});

		// added after the event load image, if not, ie7 will not display the image
		elImg.src = imgLoad;

		sdotUtilities.preventDefault(e);
	}
};








