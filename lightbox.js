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
	},

	createElement: function( obj ) { //tag id img
		var el = document.createElement(obj.tag);
		obj.id && (el.id = obj.id);
		obj.img && (el.src = obj.img);
		obj.html && (el.innerHTML = obj.html);
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
};

// temp implemantation
// http://darcyclarke.me/development/library-agnostic-pubsub-publish-subscribe/

ps = {},
ps = window.ps,
ps.subscriptions = [],
ps.subscribe = function(name, callback){
    ps.subscriptions.push({"name": name, "callback": callback});
    return [name,callback];
},
ps.unsubscribe = function(args){
    for(x=0;x<ps.subscriptions.length;x++){
        if(ps.subscriptions[x].name == args[0], ps.subscriptions[x].callback == args[1])
            ps.subscriptions.splice(x, 1);
    }
},
ps.publish = function(name, args){
    var temp = [];
    if(ps.subscriptions.length > 0){
        for(var x=0;x<ps.subscriptions.length;x++) {
            if(ps.subscriptions[x].name == name)
                temp.push({"fn":ps.subscriptions[x].callback});
        }
        for(x=0;x<temp.length;x++){
            temp[x].fn.apply(this,[args]);
        }
    }
};

//

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
		this.marginW = 20;
		this.marginH = 60;
		this.divNav;
		this.divNavHeight = 24; //the height of the div nav bar, to calculate center of img

		sdotUtilities.addEvent(this.container, 'click', this.popupInit);
	},
	
	destroyLightbox: function(elImg) {
		var elZoom = document.getElementById('zoom'),
			elBody = document.body;
		sdotUtilities.removeEvent(document.body, 'keyup', removeEventKey);
		sdotUtilities.removeEvent(sdotLightbox.elWrapper, 'click', removeWrapper);
		if (sdotLightbox.imgResized && elZoom) {
			sdotUtilities.removeEvent(elZoom, 'click', zoomEvent);
		}
		sdotUtilities.removeEvent(document.getElementById('left-arrow'), 'click', leftArrowEvent);
		sdotUtilities.removeEvent(document.getElementById('right-arrow'), 'click', rightArrowEvent);
		elBody.removeChild(sdotLightbox.elWrapper);
		elBody.style.overflow = 'visible';
		sdotUtilities.removeEvent(elImg, 'load', imgLoaded);
		sdotLightbox.elWrapper = null;
	},

	resizeImg: function( elImg ) {
		var self = sdotLightbox;
		self.realW = elImg.width;
		self.realH = elImg.height;
		var scrennWmargin = self.screenW - self.marginW;
		var screenHmargin = self.screenH - self.marginH;
		var propH = self.realH / screenHmargin, //proportion y
			propW = self.realW / scrennWmargin,	//proportion x
			resultProp = (propW > propH) ? true : false; //greater proportion

		//Resize image if needed
		if (self.realW > scrennWmargin || self.realH > screenHmargin) {
			self.imgResized = true;
			if (self.realW > self.realH) {
				if (resultProp) {
					elImg.width = scrennWmargin;
					elImg.height = (elImg.width * elImg.height) / self.realW;
				} else if (!resultProp) {
					elImg.height = screenHmargin;
					elImg.width = (elImg.width * elImg.height) / self.realH;
				}
			} else if (self.realH > self.realW) {
				if (!resultProp) {
					elImg.height = screenHmargin;
					elImg.width = (elImg.width * elImg.height) / self.realH;
				} else {
					elImg.width = scrennWmargin;
					elImg.height = (elImg.width * elImg.height) / self.realW;
				}
			}
		} else {
			self.imgResized = false;
		}

		return { h: elImg.height, w: elImg.width };
	},

	createArrow: function(id, dir) {
			var el = sdotUtilities.createElement({
				id: id,
				tag: 'div',
				styles: {
					boxShadow: 'none',
					cursor: 'pointer',
					zIndex: '101'
				},
				customAttr: { attr: 'data-dir', val: dir },
				append: sdotLightbox.divNav
			});

			return el;
	},

	navCreation: function(sizes) {
		var scrollPos = sdotUtilities.getScrollPos(),
			self = sdotLightbox;

		self.divNav = sdotUtilities.createElement({
			tag: 'div', id: 'nav-bar', className: 'nav-bar', styles: {
				width: self.screenW + 'px',
				top: (scrollPos + self.screenH - 24) + 'px'
			},
			append: self.elWrapper
		});

		var elLeftArrow = this.createArrow('left-arrow', 'prev');

		sdotUtilities.addEvent(elLeftArrow, 'click', leftArrowEvent = function(e) {
			self.nextImg(self.getNewImgSrc(--self.currentPos));
			sdotUtilities.stopPropagation(e);
		});

		var elRightArrow = this.createArrow('right-arrow', 'next');

		sdotUtilities.addEvent(elRightArrow, 'click', rightArrowEvent = function(e) {
			self.nextImg(self.getNewImgSrc(++self.currentPos));
			sdotUtilities.stopPropagation(e);
		});

		if (self.imgResized) {
			this.createZoomBtn(scrollPos, sizes, elRightArrow, elLeftArrow);
		}

		//the title body
		self.titleBody = sdotUtilities.createElement({
			tag: 'div', id: 'img-title', className: 'img-title', styles: {
				top: (scrollPos + sdotLightbox.screenH / 2 - sizes.h / 2 - self.divNavHeight / 2) + 'px',
				left: (sdotLightbox.screenW / 2 - sizes.w / 2) + 'px',
				width: (sizes.w - 24) + 'px' //substracte padding
			}
		});
		self.titleBody.innerHTML = self.allTitles[self.currentPos];
	},

	createZoomBtn: function(scrollPos, sizes, elRightArrow, elLeftArrow) {
		var zoomImg = sdotUtilities.createElement({
			id: 'zoom',
			tag: 'div',
			styles: {
				boxShadow: 'none',
				cursor: 'pointer',
				float: 'right'
			},
			append: sdotLightbox.divNav
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
			self.divNav.style.display = 'none';
			zoomImg.style.display = 'none';
			document.body.style.overflow = 'visible';
			sdotUtilities.stopPropagation(e);
		});
	},

	moveNav: function(sizes) {
		var elLeftArrow = document.getElementById('left-arrow'),
			elRightArrow = document.getElementById('right-arrow'),
			elZoom = document.getElementById('zoom'),
			scrollPos = sdotUtilities.getScrollPos(),
			self = sdotLightbox;

		if ( self.imgResized && elZoom === null ) {
			this.createZoomBtn(scrollPos, sizes, elRightArrow, elLeftArrow);
		} else if ( self.imgResized === false && elZoom ) {
			sdotUtilities.removeEvent(elZoom, 'click', zoomEvent);
			self.divNav.removeChild(elZoom);
		}

		self.titleBody.style.top = (scrollPos + self.screenH / 2 - sizes.h / 2 - self.divNavHeight / 2) + 'px';
		self.titleBody.style.left = (self.screenW / 2 - sizes.w / 2) + 'px';
		self.titleBody.style.width = (sizes.w - 24) + 'px'; //substracte padding
	},

	imgLoading: function( elLoader ) {
		var self = sdotLightbox,
			elImg = self.elImg,
			sizes = self.resizeImg(elImg),
			scrollPos = sdotUtilities.getScrollPos();

		//
		elImg.style.top = (self.screenH / 2 - sizes.h / 2 + scrollPos - self.divNavHeight / 2) + 'px';
		elImg.style.left = (self.screenW / 2 - sizes.w / 2) + 'px';
		elImg.style.opacity = 0;


		self.elWrapper.replaceChild(elImg, elLoader);
		self.animation(elImg, 0, 1);

		return sizes;
	},

	animation: function(el, start, end) {
		var cur = start,
			addRemove = (start > end) ? -0.2 : 0.2,
			pubSub = (start > end) ? 'imgHide' : 'imgShow';

		var interval = setInterval(function() {
			el.style.opacity = cur;
			cur += addRemove;
			if (cur < 0 || cur > 1) {
				clearInterval(interval);
				ps.publish(pubSub);
			}
		}, 15);
	},

	nextImg: function(imgLoad, createNav) {
		sdotLightbox.screenW = sdotUtilities.getWindowSize().windowWidth;
		sdotLightbox.screenH = sdotUtilities.getWindowSize().windowHeight;
		var self = sdotLightbox;

		self.elImg = sdotUtilities.createElement({tag: 'img', id: 'currentImg'});

		var elLoader = sdotUtilities.createElement({
			tag: 'img', id: 'loading', img: self.loadingImg, styles: {
				top: (sdotLightbox.screenH / 2 - 50 + sdotUtilities.getScrollPos()) + 'px',
				left: (sdotLightbox.screenW / 2 - 50) + 'px',
				position: 'absolute',
				zIndex: '101'
			},
			append: sdotLightbox.elWrapper
		});

		if (!createNav) {
			self.animation(document.getElementById('currentImg'), 1, 0);

			var subEndFade = ps.subscribe('imgHide', function() {

				sdotLightbox.elWrapper.replaceChild(elLoader, document.getElementById('currentImg'));

				sdotUtilities.addEvent(sdotLightbox.elImg, 'load', imgLoaded = function () {
					var sizes = self.imgLoading(elLoader);
					sdotLightbox.moveNav(sizes);
					self.titleBody.innerHTML = self.allTitles[self.currentPos];
					sdotLightbox.elWrapper.appendChild(sdotLightbox.titleBody);
				});

				// added after the event load image, if not, ie7 will not display the image
				sdotLightbox.elImg.src = imgLoad;
				ps.unsubscribe(subEndFade);
			});
		} else {
			sdotUtilities.addEvent(sdotLightbox.elImg, 'load', imgLoaded = function () {
				var sizes = self.imgLoading(elLoader);
				sdotLightbox.navCreation(sizes);
				sdotLightbox.elWrapper.appendChild(sdotLightbox.titleBody);
			});
			// added after the event load image, if not, ie7 will not display the image
			sdotLightbox.elImg.src = imgLoad;
		}
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
		if (key === 37) {
			self.nextImg(self.getNewImgSrc(--self.currentPos));
		} else if (key === 39) {
			self.nextImg(self.getNewImgSrc(++self.currentPos));
		} else if (e.keyCode === 27) {
			self.destroyLightbox(self.elImg);
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

		self.elWrapper = sdotUtilities.createElement({
			tag: 'div', className: 'wrapper', id: 'wrapper', styles: { top: 0 },
			append: document.body
		});

		self.nextImg(self.getNewImgSrc(self.currentPos), true);

		sdotUtilities.addEvent.call(self.elWrapper, self.elWrapper, 'click', removeWrapper = function() {
			self.destroyLightbox(self.elImg);
		});

		sdotUtilities.addEvent(document.body, 'keyup', removeEventKey = self.keyNavigation);

		sdotUtilities.preventDefault(e);
	}
};








