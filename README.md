## Version 0.7

* Added fadein fadeout effect for image transitions (in javascript)
* Redesigned navigation system
* Added: Show the content of the alt attribute when hover the thumb. Not sur how to implemante that, with custom params...

### TODO update :
* Looking for moving pub/sub from window global (window.ps)
* clear css, divide current theme and need css for plugin
* Center the image with margin auto, maybe better than calculating the center position
* Optimize even more the code if possible (it is ^^). Still a lot to optimize.
* Look for more customization
* Resize, reposition when the browser is resized
* add popup to tell pepole how to do key navigation
* add an auto slide

## Version 0.6
### Added
* The gallery now loop, when you are at the end, the next image is the first one.
* Key navigation (left arrow / right arrow / esc (hide lightbox))
* Attribute alt content is displayed when the image is show in the lightbox.

### TODO update:
* Optimize even more the code if possible (it is ^^). Still a lot to optimize.
* Look for more customization
* Add animation fading, sliding, etc...
* Resize, reposition when the browser is resized
* Adding the alt attribute content when hover the thumb
* add popup to tell pepole how to do key navigation
* add an auto slide

## Version 0.55

### Added
* Navigation arrow (back and forth in the gallery) and zoom button. The zoom button will only display when the image was resized. The zoomed image still remain centered if his not larger than the browser screen width.
* The possibility to popup from a simple text link (not only from thumbnail).
For simple text link, add a data-img attribute to the link with the path of the image (still need the rel=lightbox attribute).

### TODO update:
* check to loop when at the start or the end of the gallery, for now it is trowing an error.
* Optimize even more the code if possible (it is ^^), Still a lot to optimize.
* Look for more customization
* Add animation fading, sliding, etc...
* Add alt attributes in the popup image (maybe on thumbs too)
* Resize, reposition when the browser is resized

### Notes
The image thumb has to have the same name as the original image but with _thumb added to the filename.

## Version 0.4
### Added custom arguments :
* container: the html element that contain the gallery, all links have to have the attribute rel set to lightbox like <code>&lt;a href="#" rel="lightbox"&gt;image&lt;/a&gt;</code>
* loadingImg: specify a custom image for the loading time

### Code optimized :
Start the plugin :
 <pre><code>sdotLightbox.init({
	container: document.getElementById('wrap'),
	loadingImg: 'img/loading-anim.gif'
});</code></pre>

### TODO update:
* Optimize eve more the code if possible (it is ^^)
* Look for more customization
* Add animation fading, sliding, etc...
* Add navigation and close buttons, for now close the image by clicking on the background or the popup image iteself
* Add alt attributes in the popup image (maybe on thumbs too)
* Resize, reposition when the browser is resized

### Known bugs:
overflow:hidden not working on IE7

## Version 0.3.3
Now popup images are resized if needed when popup images > viewport

### TODO update:
* Optimize the code if possible (it is ^^)
* Make it easily customizable
* Add animation fading, sliding, etc...
* Add navigation and close buttons, for now close the image by clicking on the background or the popup image iteself
* Add alt attributes in the popup image (maybe on thumbs too)
* Resize, reposition when the browser is resized

## Version 0.3.1
Added variable to easily change the loading img.

### TODO update:
* Optimize the code if possible (it is ^^)
* Make it easily customizable
* Add animation fading, sliding, etc...
* resizing the popup image if it's bigger than the viewport
* Add navigation and close buttons, for now close the image by clicking on the background or the popup image iteself
* Add alt attributes in the popup image (maybe on thumbs too)
* Resize, reposition when the browser is resized

### Known bugs:
overflow:hidden not working on ie7

## Version 0.3
Refactored the code, there is only two global variables.
* One for the utilities (polyfills)
* One for the lightbox itself

### TODO:
* Optimize the code if possible (it is ^^)
* Make it easily customizable
* Add animation fadinf, sliding, etc...

## Version 0.1
Poor code, the goal is to get a lightbox effect working on IE7+, chrome and firefox.