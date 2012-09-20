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
	links: document.getElementsByTagName('a'),
	container: document.getElementById('wrap'),

	hideImg: function(elImg) {
		sdotUtilities.removeEvent(document.getElementById('wrapper'), 'click', hiddenCall);
		document.body.removeChild(document.getElementById('wrapper'));
		document.body.style.overflow = 'visible';
		sdotUtilities.removeEvent(elImg, 'load', hiddenCall2);
	},

	imgLoading: function(elImg, screenH, screenW, elWrapper, elLoader) {
		var imgW = elImg.width;
		var imgH = elImg.height;
		elImg.style.top = (screenH / 2 - imgH / 2 + sdotUtilities.getScrollPos()) + 'px';
		elImg.style.left = (screenW / 2 - imgW / 2) + 'px';
		elWrapper.replaceChild(elImg, elLoader);
	},

	popupInit: function(e) {

		var target = sdotUtilities.getTarget(e);
		if ( !target.parentNode.getAttribute('rel') || target.parentNode.getAttribute('rel') !== 'lightbox' ) {
			return false;
		}

		//Execute before calculate screen width/height
		document.body.style.overflow = 'hidden';
		
		var imgFN = target.src,
			screenW = sdotUtilities.getWindowSize().windowWidth,
			screenH = sdotUtilities.getWindowSize().windowHeight;
		
		//get only the file name
		imgFN = imgFN.slice(imgFN.lastIndexOf('/') + 1);
		//img to load
		var imgLoad = imgFN.replace('_thumb', '');
		
		var elWrapper = document.createElement('div');
		elWrapper.className = 'wrapper';
		elWrapper.id = 'wrapper';
		elWrapper.style.top = '0';

		var elLoader = document.createElement('img');
		elLoader.id = 'loading';
		elLoader.src = 'loading-anim.gif';

		var elImg = document.createElement('img');

		elLoader.style.top = (screenH / 2 - 50) + 'px';
		elLoader.style.left = (screenW / 2 - 50) + 'px';

		//merge element
		sdotUtilities.addEvent.call(elWrapper, elWrapper, 'click', hiddenCall = function() {
			sdotLightbox.hideImg(elImg);
		});

		elLoader = elWrapper.appendChild(elLoader);
		elWrapper = document.body.appendChild(elWrapper);

		sdotUtilities.addEvent(elImg, 'load', hiddenCall2 = function () {
			sdotLightbox.imgLoading(elImg, screenH, screenW, elWrapper, elLoader);
		});

		elImg.src = imgLoad; // added after the envent load image
		sdotUtilities.preventDefault(e);
	}
};

//TODO
//rajouter repositionnement de l'image lors de resize de l'écran.
//get this as a plugin and put it into all a tag with the rel=lightbox attribute
//quick note : Git seems realy powerfull !
//Playing more with git !
//voir s'il est possible de savoir si l'image est déjà chargé/dans le cache du navigateur et dès lors ne pas afficher le loading.gif.
