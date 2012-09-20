<!DOCTYPE html>
<html lang="fr">
<head>
	<meta charset="UTF-8" />
	<!-- <link href='http://fonts.googleapis.com/css?family=Bilbo+Swash+Caps' rel='stylesheet' type='text/css'> -->

	<link rel="stylesheet" href="style.css" type="text/css" />
	<!--[if lt IE 8]>
	<style type="text/css">
	.wrapper {
		background: url(bg-transparent.png) repeat;
    }
    </style>
    <![endif]-->
	<title>The popup in Vanilla JS</title>
</head>
<body>
	<div id="wrap">
		<h1>The Popup in Vanilla JS.</h1>
		<a href="#" rel="lightbox"><img src="img4_thumb.png" alt="Nice Pose." /></a>
		<p style="padding:0;margin:0;margin-bottom:20px;"><a id="outside" href="http://www.google.fr/">Go to Google.fr</a></p>
		<a href="#" rel="lightbox"><img src="nice_thumb.png" alt="Nice Pose." /></a>
		<a href="#" rel="lightbox"><img src="murderedfruit1900x1200_thumb.png" alt="Murdered Fruits" /></a>
		<a href="#" rel="lightbox"><img src="img4_thumb.png" alt="Nice Pose." /></a>
		<a href="#" rel="lightbox"><img src="img4_thumb.png" alt="Nice Pose." /></a>
		<a href="#" rel="lightbox"><img src="img4_thumb.png" alt="Nice Pose." /></a>
		<a href="#" rel="lightbox"><img src="img4_thumb.png" alt="Nice Pose." /></a>
		<a href="#" rel="lightbox"><img src="img4_thumb.png" alt="Nice Pose." /></a>
		<a href="#" rel="lightbox"><img src="img4_thumb.png" alt="Nice Pose." /></a>
		<a href="#" rel="lightbox"><img src="img4_thumb.png" alt="Nice Pose." /></a>
	</div>
	<script src="lightbox.js"></script>
	<script type="text/javascript">
		//for testing
		sdotUtilities.addEvent(document.getElementById('outside'), 'click', function(e){
			sdotUtilities.preventDefault(e);
			console.log('links clicked, preventDefault ok.');
		});

		sdotUtilities.addEvent(sdotLightbox.container, 'click', sdotLightbox.popupInit);

	</script>
</body>
</html>