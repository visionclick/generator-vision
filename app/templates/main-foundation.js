

(function(){


	$(document).foundation();



	$(document).ready(function(){

		if( window.location.hash.substr(1)  === 'seo'{
			$(body).addClass('seo-mode')
		}
		if( window.location.hash.substr(1)  === 'dev'{
			$(body).addClass('dev-mode')
		}
	});

	$(window).ready(function(){
		$('.js-slick').removeClass('js-slick');
	})

}());
