/*
 * WhatsPlaying.js
 * 
 * Ajaxified last.fm tack history
 *
 * Author: joe
 *
 */

// TODO:
// generic artist image
// user accounts without images (generic user image)
// more error handling
// refactor shit
//   - make data methods return data instead of setting markup
//   - sort setRecentlyPlayedTracks() out
// make the favicon change on theme change.
// make title change on track change
//
// play stats and other last.fm stuff... otherwise this may as well be built on the spotify API..

// Constants
var apiKey = '5600cc0bd26ae12cea9724446e37ea6a';
var recentTracksLimit = 3;
var genericAlbumArtLocation = 'generic_album_art.png';
var refreshRate = 4000;

var themes = {
	"light-red": {
		"style": {
			"body": { "background": "#eee", "color": "#444" },
			"ul#tracks": {"color": "inherit", "text-shadow": "0 1px #fff"},
			"ul#tracks #now-playing-track": {"color": "#e73137"},
			"img.album-art, img.artist-image": {"border-color": "rgba(51,51,51,0.8)"},
			"header": {"background": "#333", "color": "#fff"}
		},
		"color": "#e73137",
		"name": "light-red"
	},
	"dark-cyan": {
		"style": {
			"body": { "background": "#555", "color": "#3ab" },
			"ul#tracks": {"color": "#3ab", "text-shadow": "0 1px #333"},
			"ul#tracks #now-playing-track": {"color": "#3cd"},
			"img.album-art, img.artist-image": {"border-color": "rgba(51,51,51,0.8)"},
			"header": {"background": "#333", "color": "#fff"}
		},
		"color": "#3cd",
		"name": "dark-cyan"
	},
	"blue-white": {
		"style": {
			"body": { "background": "#37b", "color": "#ffc" },
			"ul#tracks": {"color": "#ffc", "text-shadow": "0 1px #479"},
			"ul#tracks #now-playing-track": {"color": "#ffc"},
			"img.album-art, img.artist-image": {"border-color": "rgba(17,85,153,0.5)"},
			"header": {"background": "#159", "color": "#ffc"}
		},
		"color": "#ffc",
		"name": "blue-white"
	},
}

var cachedResponse, currentUser, timer, currentTheme, themeNowPlayingIcon;

function init(user) {
	if($.cookie("currentUser") != null)
		changeAccount($.cookie("currentUser"));
	else
		changeAccount(user);

	if($.cookie("currentTheme") != null)
		currentTheme = $.cookie("currentTheme");
	else
		currentTheme = "light-red";

	$(document).ready(function() {
		timer = window.setInterval("setRecentlyPlayedTracks(currentUser, false)",
			refreshRate);

		$('#color-picker #theme-1').click(function() {
			applyCss(themes['light-red']);
			currentTheme = 'light-red';
		});

		$('#color-picker #theme-2').click(function() {
			applyCss(themes['dark-cyan']);
			currentTheme = 'dark-cyan';
		});

		$('#color-picker #theme-3').click(function() {
			applyCss(themes['blue-white']);
			currentTheme = 'blue-white';
		});

		themeNowPlayingIcon = createNowPlayingIcon(themes[currentTheme]["color"]);

		$('input#account-search').focus(function() {
			$('input#account-search').animate({width: '200px'});
			$('input#account-search').val('');
		}).blur(function() {
			$('input#account-search').val('find user').animate({width: '150px'});
			$('input#account-search').css('box-shadow', 'none');
			$('input#account-search').css('color', '#333');
			$('input#account-search').css('background-color', '#eee');
		});

		$('input#account-search').keydown(function(e) {
			if(e.keyCode == 13) {
				user = $('input#account-search').val();
				changeAccount(user);
			}
			else {
				$('input#account-search').css('box-shadow', 'none');
				$('input#account-search').css('color', '#333');
				$('input#account-search').css('background-color', '#eee');
			}
		});
	});
}

function changeAccount(user, callback) {
	//console.log('setting account details for ' + user);
	var userAccountUrl = 'http://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=' + user
			+ '&api_key=' + apiKey
			+ '&format=json';
	$.getJSON(userAccountUrl, function(response) {
		// console.log(response);
		if(response.error == null) {
			clearInterval(timer);
			timer = window.setInterval("setRecentlyPlayedTracks(currentUser, false)",
				refreshRate);

			$('div#account #user-section').fadeOut(function() {
				$('div#account img#profile-picture').attr('src', response.user.image[1]['#text']).parent().attr('href', response.user.url).attr('target', '_blank');
				$('div#account span#account-name > a').text(response.user.name).attr('href', response.user.url).attr('target', '_blank');
				if(user != currentUser) {
					$('ul#tracks').empty();
					$('.spinner').fadeIn(function() {
						setRecentlyPlayedTracks(user);
					});
				}
				currentUser = user;
				$.cookie('currentUser', user)
			}).fadeIn();
		}
		else {
			switch(response.error){
				case 6:	// account not found
					$('input#account-search').css('box-shadow', '0 0 10px #e73137');
					$('input#account-search').css('color', '#e73137');
					$('input#account-search').css('background-color', '#fee');
			}
		}
	});

	if(typeof(callback) == "function")
		callback();
}

function setRecentlyPlayedTracks(user, forceRedraw, callback) {
	if(user == null)
		return;

	//console.log('setting tracks for ' + user)
	var recentTracksUrl = 'http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=' + user
	+ '&api_key=' + apiKey
	+ '&limit=' + recentTracksLimit
	+ '&format=json';

	$.getJSON(recentTracksUrl, function(response) {
		//console.log(recentTracksUrl);
		//console.log(response);
		if(hasResponseChanged(response) || forceRedraw) {
			$('.spinner').fadeOut(function() {
				cachedResponse = response;
				$('ul#tracks').fadeOut(function() {
					$('ul#tracks').empty();
					$.each(response.recenttracks.track, function(i, track) {
						//console.log(track);
						if(i == 0 && track['@attr'] == null) {
							$('ul#tracks').append('<li class="now-playing"><div id="now-playing-track">it\'s gone quiet :(</div></li>');
							$('ul#tracks').append('<li>' + track.artist['#text'] + ' - ' + track.name + '<span class="time">' + timeAgoFromEpochTime(track.date.uts) + '</span></li>');
						}
						else if(track['@attr'] != null && track['@attr'].nowplaying == 'true') {
							$('ul#tracks').append('<li class="now-playing">\
										<div class="image-container">\
										<div id="track-container">\
										<div id="track-options"></div>\
										<img class="album-art" />\
										</div>\
										<img class="artist-image" />\
										</div>\
										<div id="now-playing-track">\
										<span id="now-playing-icon-container">' + themeNowPlayingIcon + "</span>" + track.artist['#text'] + ' - ' + track.name + '\
										</div>\
										</li>');
					
							$('ul#tracks').trigger('trackChanged');
							
							generateTrackOptionButtons(track.artist['#text'] + ' - ' + track.name, function(result) {
							$('div#track-options').append(result);
							setArtistImageUrl(track.artist['#text']);
							setAlbumArt(track.image[3]['#text']);
						});
						}
						else {
							if(track.artist != null) {
								$('ul#tracks').append('<li>' + track.artist['#text'] + ' - ' + track.name + '<span class="time">' + timeAgoFromEpochTime(track.date.uts) + '</span></li>');
							}
							else {
								$('ul#tracks').append('<li class="now-playing"><div id="now-playing-track">it\'s gone quiet :(</div></li>');
								$('ul#tracks').append('<li>' + response.recenttracks.track.artist['#text'] + ' - ' + response.recenttracks.track.name + '<span class="time">' + timeAgoFromEpochTime(response.recenttracks.track.date.uts) + '</span></li>');								// the only reason to be in this block is when only one track has been played, ever.
								// in this case, the track is an object, not an array, but javascript is retarded
								// and wants to iterate over all the properties of the object as if they were array elements (tracks).
								//
								// ... so we end the iterating by returning false.
								return false;
							}
						}
						
						
						if($.cookie('currentTheme') != null) {
							applyCss(themes[$.cookie('currentTheme')]);
						}
						else {
							applyCss(themes['light-red']);
							currentTheme = 'light-red';
						}
					});
				}).fadeIn();
			});
		}
	});
}

function hasResponseChanged(response) {
	//console.log('cached response')
	//console.log(cachedResponse)
	//console.log('this response')
	//console.log(result + '\n')
	if (cachedResponse == null && response != null)
		return true;

	var firstCachedTrack = getFirstTrack(cachedResponse.recenttracks.track);
	var firstIncomingTrack = getFirstTrack(response.recenttracks.track);
	if((cachedResponse.recenttracks['@attr'] != null && response.recenttracks['@attr'] != null ) && (cachedResponse.recenttracks['@attr'].total != response.recenttracks['@attr'].total)
		|| firstCachedTrack.url != firstIncomingTrack.url
		|| firstCachedTrack.date != null && firstIncomingTrack.date == null
		|| firstCachedTrack.date == null && firstIncomingTrack.date != null
		|| firstCachedTrack.date != null && firstCachedTrack.date.uts != null && (firstIncomingTrack.date != null || firstIncomingTrack.date.uts == null) && firstCachedTrack.date.uts != firstIncomingTrack.date.uts
		|| firstCachedTrack.date != null && firstCachedTrack.date.uts != firstIncomingTrack.date.uts
		|| (cachedResponse.recenttracks['@attr'] != null && cachedResponse.recenttracks['@attr'].nowplaying != response.recenttracks['@attr'].nowplaying)) {
		return true;
	}
  return false;
}

function getFirstTrack(track){
	if(track.length == null)
		return track;
	
	return track[0];
}

function setAlbumArt(image) {
	if(image == '' || image == 'undefined' || image == null) {
		$('ul#tracks li img.album-art').attr('src', genericAlbumArtLocation);
	}
	else {
		$('ul#tracks li img.album-art').attr('src', image);
	}
}

function setArtistImageUrl(artist) {
	var artistInfoUrl = 'http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=' + artist
	+ '&api_key=' + apiKey
	+ '&format=json';

	//console.log(artistInfoUrl)

	$.getJSON(artistInfoUrl, function(response) {
		//console.log(response.artist.image[2]['#text']);
		$('ul#tracks li img.artist-image').attr('src', response.artist.image[2]['#text'].replace('126', '126s'));
	});
}

function applyCss(theme) {
	$.each(theme["style"], function(element){
		$.each(theme["style"][element], function(property) {
			$(element).css(property, theme["style"][element][property]);
		});
	});
	$('span#now-playing-icon-container').empty().append(createNowPlayingIcon(theme["color"]));	// todo make this work
	$.cookie('currentTheme', theme.name)
}

function timeAgoFromEpochTime(epoch) {
	var secs = Math.floor(((new Date()).getTime() / 1000) - epoch);

	var minutes = secs / 60;
	secs = Math.floor(secs % 60);

	if (minutes < 1)
		return 'just now';

	var hours = minutes / 60;
	minutes = Math.floor(minutes % 60);

	if (hours < 1)
		return minutes + (minutes > 1 ? ' mins' : ' min');

	var days = hours / 24;
	hours = Math.floor(hours % 24);

	if (days < 1)
		return hours + (hours > 1 ? ' hrs' : ' hr');

	var weeks = days / 7;
	days = Math.floor(days % 7);

	if (weeks < 1)
		return days + (days > 1 ? ' days' : ' day');

	var months = weeks / 4.35;
	weeks = Math.floor(weeks % 4.35);

	if (months < 1)
		return weeks + (weeks > 1 ? ' wks' : ' week');

	var years = months / 12;
	months = Math.floor(months % 12);

	if (years < 1)
		return months + (months > 1 ? ' mths' : ' month');

	years = Math.floor(years);

	return years + (years > 1 ? ' yrs' : ' year');
}

function createNowPlayingIcon(color) {
	var svg = '<svg\
		xmlns:dc="http://purl.org/dc/elements/1.1/"\
		xmlns:cc="http://web.resource.org/cc/"\
		xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\
		xmlns:svg="http://www.w3.org/2000/svg"\
		xmlns="http://www.w3.org/2000/svg"\
		xml:space="preserve"\
		version="1.0"\
		id="layer1"\
		width="40pt" height="40pt"\
		viewBox="0 0 75 75"><metadata\
		id="metadata1"><rdf:RDF><cc:Work\
		rdf:about=""><dc:format>image/svg+xml</dc:format><dc:type\
		rdf:resource="http://purl.org/dc/dcmitype/StillImage" /></cc:Work></rdf:RDF></metadata><g\
		id="g1"><polygon\
		id="polygon1"\
		points="39.389,13.769 22.235,28.606 6,28.606 6,47.699 21.989,47.699 39.389,62.75 39.389,13.769"\
		style="stroke:#e73137;stroke-width:5;stroke-linejoin:round;fill:#e73137;"\
		/><path id="path1"\
		d="M 48.128,49.03 C 50.057,45.934 51.19,42.291 51.19,38.377 C 51.19,34.399 50.026,30.703 48.043,27.577"\
		style="fill:none;stroke:#e73137;stroke-width:5;stroke-linecap:round"/>\
		<path id="path2"\
		d="M 55.082,20.537 C 58.777,25.523 60.966,31.694 60.966,38.377 C 60.966,44.998 58.815,51.115 55.178,56.076"\
		style="fill:none;stroke:#e73137;stroke-width:5;stroke-linecap:round"/>\
		<path id="path1"\
		d="M 61.71,62.611 C 66.977,55.945 70.128,47.531 70.128,38.378 C 70.128,29.161 66.936,20.696 61.609,14.01"\
		style="fill:none;stroke:#e73137;stroke-width:5;stroke-linecap:round"/>\
		</g>\
		</svg>';
		
	return svg.replace(/#e73137/g, color);
}

function generateTrackOptionButtons(nowPlaying, callback) {
  var twitter = '<li class="glow"><a href="https://twitter.com/intent/tweet?button_hashtag=whatsplaying&text=Now Playing: ' + nowPlaying + '" class="twitter-hashtag-button" data-lang="en"><img src="twitter.png" /></a></li>';
  var spotify = '';
  getSpotifyLink(nowPlaying, function(result) {
    if(result != null) {
      spotify = '<li>\
                    <div class="multi-option-container">\
                      <a class="glow" style="display:block" href="' + result.native + '"><img src="spotify.png" class="icon" /></a>\
			<a class="glow" style="line-height:24px;margin-top:1em;display:block;visibility:hidden;font-size:small" href="' + result.web + '" target="_blank"><img src="spotify.png" style="margin-right:4px" class="icon-small" /><span style="vertical-align:middle">web</span></a>\
                    </div>\
                </li>';
    }
    callback('<ul id="track-options">' + twitter + spotify + '</ul>');
  });
}

function getSpotifyLink(nowPlaying, callback) {
  var spotifySearchURL = 'https://api.spotify.com/v1/search?q=' + nowPlaying + '&type=track&limit=1';
  var result;
  $.getJSON(spotifySearchURL, function(response) {
    if(response.tracks.items.length > 0) {
      result = { "web": response.tracks.items[0]['external_urls'].spotify, "native": response.tracks.items[0].uri };
      callback(result);
    }
    callback(null);
  });
}
