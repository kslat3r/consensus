$(window).load(function() {
	$('.slider').find('img').show();

	$('.slider').bxSlider({
	  minSlides: 1,
	  maxSlides: 1,
	  slideWidth: 284,
	  auto: true,
	  controls: false,
	  pause: 10000
	});
});