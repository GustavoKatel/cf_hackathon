$(document).ready(function() {

	/*============================================
	Page Preloader
	==============================================*/

	$(window).load(function(){
		$('#page-loader').fadeOut(500,function(){
			// loadGmap();
		});

	})

	/*============================================
	Header
	==============================================*/

	$('#home').height($(window).height()+50);

	$.backstretch('assets/images/header-bg.jpg');

	$(window).scroll( function() {
		var st = $(this).scrollTop(),
			wh = $(window).height(),
			sf = 1.2 - st/(10*wh);

		$('.backstretch img').css({
			'transform' : 'scale('+sf+')',
			'-webkit-transform' : 'scale('+sf+')'
		});

		$('#home .container').css({ 'opacity' : (1.4 - st/400) });

		if($(window).scrollTop() > ($(window).height()+50)){
			$('.backstretch').hide();
		}else{
			$('.backstretch').show();
		}

	});

	var st = $(this).scrollTop(),
		wh = $(window).height(),
		sf = 1.2 - st/(10*wh);

	$('.backstretch img').css({
		'transform' : 'scale('+sf+')',
		'-webkit-transform' : 'scale('+sf+')'
	});

	$('#home .container').css({ 'opacity' : (1.4 - st/400) });


	/*============================================
	Navigation Functions
	==============================================*/
	if ($(window).scrollTop()< ($(window).height()-50)){
		$('#main-nav').removeClass('scrolled');
	}
	else{
		$('#main-nav').addClass('scrolled');
	}

	$(window).scroll(function(){
		if ($(window).scrollTop()< ($(window).height()-50)){
			$('#main-nav').removeClass('scrolled');
		}
		else{
			$('#main-nav').addClass('scrolled');
		}
	});

	/*============================================
	ScrollTo Links
	==============================================*/
	$('a.scrollto').click(function(e){
		$('html,body').scrollTo(this.hash, this.hash, {gap:{y:0}});
		e.preventDefault();

		if ($('.navbar-collapse').hasClass('in')){
			$('.navbar-collapse').removeClass('in').addClass('collapse');
		}
	});

	/*============================================
	Skills
	==============================================*/
	$('.skills-item').each(function(){
		var perc = $(this).find('.percent').data('percent');

		$(this).data('height',perc);
	})

	$('.touch .skills-item').each(function(){
		$(this).css({'height':$(this).data('height')+'%'});
	})

	$('.touch .skills-bars').css({'opacity':1});

	/*============================================
	Project thumbs - Masonry
	==============================================*/
	$(window).load(function(){

		$('#projects-container').css({visibility:'visible'});

		$('#projects-container').masonry({
			itemSelector: '.project-item:not(.filtered)',
			//columnWidth:370,
			isFitWidth: true,
			isResizable: true,
			isAnimated: !Modernizr.csstransitions,
			gutterWidth: 25
		});

		scrollSpyRefresh();
		waypointsRefresh();

	});

	/*============================================
	Filter Projects
	==============================================*/
	$('#filter-works a').click(function(e){
		e.preventDefault();

		if($('#project-preview').hasClass('open')){
			closeProject();
		}

		$('#filter-works li').removeClass('active');
		$(this).parent('li').addClass('active');

		var category = $(this).attr('data-filter');

		$('.project-item').each(function(){
			if($(this).is(category)){
				$(this).removeClass('filtered');
			}
			else{
				$(this).addClass('filtered');
			}

			$('#projects-container').masonry('reload');
		});

		scrollSpyRefresh();
		waypointsRefresh();
	});

	/*============================================
	Project Preview
	==============================================*/
	$('.project-item').click(function(e){
		e.preventDefault();

		var elem = $(this),
			title = elem.find('.project-title').text(),
			descr = elem.find('.project-description').html(),
			slidesHtml = '<ul class="slides">',
			elemDataCont = elem.find('.project-description');

			slides = elem.find('.project-description').data('images').split(',');

		for (var i = 0; i < slides.length; ++i) {
			slidesHtml = slidesHtml + '<li><img src='+slides[i]+' alt=""></li>';
		}

		slidesHtml = slidesHtml + '</ul>';

		$('#project-title').text(title);
		$('#project-content').html(descr);
		$('#project-slider').html(slidesHtml);

		openProject();

	});

	function openProject(){

		$('#project-preview').addClass('open');
		$('.masonry-wrapper').animate({'opacity':0},300);

		setTimeout(function(){
			$('#project-preview').slideDown();
			$('.masonry-wrapper').slideUp();

			$('html,body').scrollTo(0,'#filter-works',
				{
					gap:{y:-20},
					animation:{
						duration:400
					}
			});

			$('#project-slider').flexslider({
				prevText: '<i class="fa fa-angle-left"></i>',
				nextText: '<i class="fa fa-angle-right"></i>',
				animation: 'slide',
				slideshowSpeed: 3000,
				useCSS: true,
				controlNav: true,
				pauseOnAction: false,
				pauseOnHover: true,
				smoothHeight: false,
				start: function(){
					$(window).trigger('resize');
					$('#project-preview').animate({'opacity':1},300);
				}
			});

		},300);

	}

	function closeProject(){

		$('#project-preview').removeClass('open');
		$('#project-preview').animate({'opacity':0},300);

		setTimeout(function(){
			$('.masonry-wrapper').slideDown();
			$('#project-preview').slideUp();

			$('#project-slider').flexslider('destroy');
			$('.masonry-wrapper').animate({'opacity':1},300);


		},300);

		setTimeout(function(){
			$('#projects-container').masonry('reload');
		},500)
	}

	$('.close-preview').click(function(){
		closeProject();
	})

	/*============================================
	Twitter
	==============================================*/
	var tweetsLength = $('#twitter-slider').data('tweets-length'),
		widgetID = $('#twitter-slider').data('widget-id');

	twitterFetcher.fetch(widgetID, 'twitter-slider', tweetsLength, true, false, true, '', false, handleTweets);

	function handleTweets(tweets){

		var x = tweets.length,
			n = 0,
			tweetsHtml = '<ul class="slides">';

		while(n < x) {
			tweetsHtml += '<li>' + tweets[n] + '</li>';
			n++;
		}

		tweetsHtml += '</ul>';
		$('#twitter-slider').html(tweetsHtml);

		$('.twitter_reply_icon').html("<i class='fa fa-reply'></i>");
		$('.twitter_retweet_icon').html("<i class='fa fa-retweet'></i>");
		$('.twitter_fav_icon').html("<i class='fa fa-star'></i>");

		$('#twitter-slider').flexslider({
			prevText: '<i class="fa fa-angle-left"></i>',
			nextText: '<i class="fa fa-angle-right"></i>',
			slideshowSpeed: 5000,
			useCSS: true,
			controlNav: false,
			pauseOnAction: false,
			pauseOnHover: true,
			smoothHeight: false
		});
	}
	/*============================================
	Contact Map
	==============================================*/
	function loadGmap(){

	if($('#gmap').length){

		var map;
		var mapstyles = [ { "stylers": [ { "saturation": -100 } ] } ];

		var infoWindow = new google.maps.InfoWindow;

		var pointLatLng = new google.maps.LatLng(mapPoint.lat, mapPoint.lng);

		var mapOptions = {
			zoom: mapPoint.zoom,
			center: pointLatLng,
			zoomControl : true,
			panControl : false,
			streetViewControl : false,
			mapTypeControl: false,
			overviewMapControl: false,
			scrollwheel: false,
			styles: mapstyles
		}

		map = new google.maps.Map(document.getElementById("gmap"), mapOptions);

		var marker = new google.maps.Marker({
			position: pointLatLng,
			map: map,
			title:mapPoint.linkText,
			icon: mapPoint.icon
		});

		var mapLink = 'https://www.google.com/maps/preview?ll='+mapPoint.lat+','+mapPoint.lng+'&z=14&q='+mapPoint.mapAddress;

		var html = '<div class="infowin">'
				+ mapPoint.infoText
				+ '<a href="'+mapLink+'" target="_blank">'+mapPoint.linkText+'</a>'
				+ '</div>';

		google.maps.event.addListener(marker, 'mouseover', function() {
			infoWindow.setContent(html);
			infoWindow.open(map, marker);
		});

		google.maps.event.addListener(marker, 'click', function() {
			window.open(mapLink,'_blank');
		});

	}
	}
	/*============================================
	Waypoints Animations
	==============================================*/
	$('#skills').waypoint(function(){

		$('.skills-item').each(function(){
			$(this).css({'height':$(this).data('height')+'%'});
		})

		$('.skills-bars').css({'opacity':1});

	},{offset:'40%'});

	$('.scrollimation').waypoint(function(){
		$(this).addClass('in');
	},{offset:'90%'});

	/*============================================
	Resize Functions
	==============================================*/
	var thumbSize = $('.project-item').width();

	$(window).resize(function(){
		$('#home').height($(window).height()+50);

		if($('.project-item').width() != thumbSize){

			$('#projects-container').masonry('reload');
			thumbSize = $('.project-item').width();
		}

		scrollSpyRefresh();
		waypointsRefresh();
	});

	/*============================================
	Refresh scrollSpy function
	==============================================*/
	function scrollSpyRefresh(){
		setTimeout(function(){
			$('body').scrollspy('refresh');
		},1000);
	}

	/*============================================
	Refresh waypoints function
	==============================================*/
	function waypointsRefresh(){
		setTimeout(function(){
			$.waypoints('refresh');
		},1000);
	}

});
