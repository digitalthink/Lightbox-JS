//utility

var addEvent = (function() {
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
})();

var removeEvent = (function() {
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
})();

var getTarget = function(e) {
	if (typeof e.target !== 'undefined') {
		return e.target;
	} else if ( typeof window.event !== 'undefined') {
		return e.srcElement;
	}
};

var preventDefault = function(e) {
	if ( typeof e.preventDefault !== 'undefined' ) {
		e.preventDefault();
	} else {
		e.returnValue = false;
	}
}

var getScrollPos = function() {
	if ( typeof window.scrollY !== 'undefined') {
		return window.scrollY;
	} else {
		return document.documentElement.scrollTop;
	}
}

var getWindowSize = function() {
	if (typeof window.innerWidth !== 'undefined') {
		return { windowWidth: window.innerWidth, windowHeight: window.innerHeight };
	} else if ( typeof document.body.offsetWidth !== 'undefined' ) {
		return { windowWidth: document.documentElement.clientWidth, windowHeight: document.documentElement.clientHeight };
	}
}

//End Utility

//code
var links = document.getElementsByTagName('a');

var hideImg = function(elImg) {
	removeEvent(document.getElementById('wrapper'), 'click', hiddenCall);
	document.body.removeChild(document.getElementById('wrapper'));
	document.body.style.overflow = 'visible';
	removeEvent(elImg, 'load', hiddenCall2);
};

var imgLoading = function(elImg, screenH, screenW, elWrapper, elLoader) {
		var imgW = elImg.width;
		var imgH = elImg.height;
		elImg.style.top = (screenH / 2 - imgH / 2) + 'px';
		elImg.style.left = (screenW / 2 - imgW / 2) + 'px';
		elWrapper.replaceChild(elImg, elLoader);
};

// var imgPreloader = new Image();

//for testing
addEvent(document.getElementById('outside'), 'click', function(e){
	preventDefault(e);
	alert('ok');
});

addEvent(links[0], 'click', function(e) {

	var target = getTarget(e),
		imgFN = target.src;
	
	document.body.style.overflow = 'hidden'; //en 1er pour le bon calcul des positionnements
	
	imgFN = imgFN.slice(imgFN.lastIndexOf('/') + 1); //get only the file name
	var imgLoad = imgFN.replace('_thumb', ''); //img to load
	
	var elWrapper = document.createElement('div');
	elWrapper.className = 'wrapper';
	elWrapper.id = 'wrapper';
	elWrapper.style.top = getScrollPos() + 'px';

	var elLoader = document.createElement('img');
	elLoader.id = 'loading';
	elLoader.src = 'loading-anim.gif';

	var elImg = document.createElement('img');

	//sizes

	var screenW = getWindowSize().windowWidth;
	var screenH = getWindowSize().windowHeight;

	elLoader.style.top = (screenH / 2 - 50) + 'px';
	elLoader.style.left = (screenW / 2 - 50) + 'px';

	//merge element
	addEvent.call(elWrapper, elWrapper, 'click', hiddenCall = function() {
		hideImg(elImg);
	});
	elLoader = elWrapper.appendChild(elLoader);
	elWrapper = document.body.appendChild(elWrapper);
	addEvent(elImg, 'load', hiddenCall2 = function () {
		imgLoading(elImg, screenH, screenW, elWrapper, elLoader);
	});
	elImg.src = imgLoad; // added after the envent load image
	preventDefault(e);
}, false);

//TODO
//rajouter repositionnement de l'image lors de resize de l'écran.
//get this as a plugin and put it into all a tag with the rel=lightbox attribute
//quick note : Git seems realy powerfull !
//Playing more with git !
//voir s'il est possible de savoir si l'image est déjà chargé/dans le cache du navigateur et dès lors ne pas afficher le loading.gif.
