<!DOCTYPE html>
<html lang="fr">
<head>
	<meta charset="UTF-8" />
	<link href='http://fonts.googleapis.com/css?family=Bilbo+Swash+Caps' rel='stylesheet' type='text/css'>

	<link rel="stylesheet" href="style.css" type="text/css" />
	<!--[if lt IE 8]>
	<style type="text/css">
	.wrapper {
		background: url(img/bg-transparent.png) repeat;
    }
    </style>
    <![endif]-->
	<title>Lightbox in Vanilla JS</title>
</head>
<body>
	<div class="fork-me-github"><a href="#"></a></div>
	<div id="wrap" class="cf">
		<h1>Lightbox in Vanilla JS.</h1>
		<div class="lcol">
			<a href="#" rel="lightbox"><img src="gallery/great_thumb.jpg" alt="Great Pose." /></a>
			<a href="#" rel="lightbox"><img src="gallery/swim_thumb.jpg" alt="Go to Pool." /></a>
			<p style="padding:0;margin:0;margin-bottom:20px;"><a alt="Awesome Infographie!" href="#" data-img="img/infographie.png" rel="lightbox">Voir l'infographie</a></p>
			<a href="#" rel="lightbox"><img src="gallery/imga_01_thumb.jpg" alt="Red" /></a>
			<a href="#" rel="lightbox"><img src="gallery/imga_02_thumb.jpg" alt="Nice garment..." /></a>
			<p style="padding:0;margin:0;margin-bottom:20px;"><a id="outside" href="http://www.google.fr/">Go to Google.fr</a></p>
			<a href="#" rel="lightbox"><img src="gallery/nice_thumb.png" alt="Nice Pose." /></a>
		</div>
		<div class="rcol">
			<a href="#" rel="lightbox"><img src="gallery/murderedfruit1900x1200_thumb.png" alt="Murdered Fruits" /></a>
			<a href="#" rel="lightbox"><img src="gallery/got_milk_thumb.png" alt="Got Milk ?" /></a>
			<a href="#" rel="lightbox"><img src="gallery/mountain_thumb.png" alt="Mountain" /></a>
			<a href="#" rel="lightbox"><img src="gallery/blonde_thumb.png" alt="Blond" /></a>
			<a href="#" rel="lightbox"><img src="gallery/natalie-portman_thumb.jpg" alt="Natalie Portman" /></a>
			<a href="#" rel="lightbox"><img src="gallery/olivia-wilde_thumb.jpg" alt="Olivia Wilde" /></a>
		</div>
		
	
	</div>
	<script src="lightbox.js"></script>
	<script type="text/javascript">
		
		sdotLightbox.init({
			container: document.getElementById('wrap'),
			loadingImg: 'img/loader2.gif'
		});

		//for testing
		sdotUtilities.addEvent(document.getElementById('outside'), 'click', function(e){
			sdotUtilities.preventDefault(e);
			console.log('links clicked, preventDefault ok.');
		});

		

	</script>
</body>
</html>