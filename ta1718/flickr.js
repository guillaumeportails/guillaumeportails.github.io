$(document).ready(function(){

    const ID = '50411456@N07';
	console.log('on.ready  tags="' + document.getElementById("flickrfeed").tagSelected + '"');
	
	function shorten(s) {
		return s.substr(0,10) + ' ' + s.substr(11,5);
	}
	
	$('#flickrfeed').jflickrfeed({
		limit: 12,
		qstrings: { id: ID,	tagmode:'all', tags: document.getElementById("flickrfeed").tagSelected },
		useTemplate: false,
		itemTemplate: '{{date_taken}}<br><a href="{{image}}"><img src="{{image_m}}" alt="{{title}}" /></a><br>',
		itemCallback: function(item){
			var t = shorten(item.date_taken);
			$(this).append(
				'<br style="line-height:4px"><button disabled="yes">' + t + '</button>'
				+ '<a href="' + item.link + '" target="_blank">'
				+ '<img src="' + item.image_m + '" alt="' + item.title + '" /></a><br>');
		} //, function (data) { $('#flickrfeed a').colorbox(); }
	});

    $("button").click(function(){
		var me = $(this);
 		console.log('clic ' + document.getElementById('flickrfeed').aaa);
		// TODO: transmettre aaa (date de la photo) à la carte
		// TODO: comment remonter le flickr.photos.geo.getLocation() vers la carte ?
		// Utiliser une URL du service map de flickr :
		// 	https://www.flickr.com/map?&fLat=-34.4739&fLon=172.7122&zl=13
		//	https://www.flickr.com/photos/tags/Te%20Araroa/map?&fLat=-34.4739&fLon=172.7121&zl=13
		//	https://www.flickr.com/map?&fLat=-34.4739&fLon=172.7122&zl=13&tags=animal#
		//	https://www.flickr.com/photos/flyingkiwigirl/map?&fLat=-34.4739&fLon=172.7122&zl=13
		
		
    });

});
	
	
