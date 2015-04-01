/*
 * Spotify Controller
 *
 * Spotify controls for the Hugo & Cat Spotify box.
 * Designed to be used with WhatsPlaying.js.
 * 
 * (c) joe
 *
 */

// TODO: controls render even if you can't reach the host

var host = "http://192.168.7.96:3000";
var account = "hugoandcat";

$(document).ready(function() {
	renderControlsIfHostIsReachable();
	$("ul#tracks").on("trackChanged", renderControlsIfHostIsReachable);
});

function renderControlsIfHostIsReachable() {
	if(currentUser === account) {
		$.ajax({url: host,
			timeout: 3000,
			type: "HEAD",
			statusCode: {
			200: function(response) {
				renderControls();
			},
			0: function(response) {
				renderControls();
			}
		}});
	}
}

function renderControls() {
	$("div#spotify-controls").remove();
	$("div#now-playing-track").before('<div id="spotify-controls"></div>');
	$("div#spotify-controls").append('<span onclick="previous()">' + iconFactory('prev') + '</span>');
	$("div#spotify-controls").append('<span onclick="play()">' + iconFactory('play') + '</span>');
	$("div#spotify-controls").append('<span onclick="pause()">' + iconFactory('pause') + '</span>');
	$("div#spotify-controls").append('<span onclick="next()">' + iconFactory('next') + '</span>');
	$("div#spotify-controls").append('<!--<button onclick="togglePlay()">toggle play</button>-->');
	$("div#spotify-controls").append('<!--<input type="range" id="volume" min="0" max="100">-->');
}

function togglePlay() {
	var url = host + "/togglePlay";
	get(url);
}

function play() {
	var url = host + "/play";
	get(url);
}

function pause() {
	var url = host + "/pause";
	get(url);
}

function next() {
	var url = host + "/next";
	get(url);
}

function previous() {
	var url = host + "/prev";
	get(url);
}

function restart() {
	var url = host + "/restart";
	get(url);
}

function setVolume(value) {
	if(isNaN(value) || value < 0 || value > 100) {
		console.log("bad value");
		return;
	}
	var url = host + "/volume/" + value;
	get(url);
}

function get(url, callback){
	// until Access-Control-Allow-Origin is used server-side, this will
	// fall over to fail().
	//
	// but it still works. i don't know why.
	$.get(url, function(response){
		console.log("GET success:");
		console.log(response);
		//callback();
	}).fail(function(response) {
		console.log("GET failure:");
		console.log(response);
		//callback();
	});
}

function iconFactory(type, color) {
	//color = "#333"; // color hack
	var playIcon = '<?xml version="1.0"?><svg width="24" height="28.3" xmlns="http://www.w3.org/2000/svg"><g><rect fill="none" id="canvas_background" height="30.3" width="26" y="-1" x="-1"/></g><g><path id="svg_7" d="m22.536974,12.906193l-19.979007,-12.376999c-1.456985,-0.951995 -2.645996,-0.25299 -2.645996,1.561997l0,24.02301c0,1.811981 1.188004,2.518005 2.645996,1.561981l19.979007,-12.374986c0,0 0.710999,-0.499999 0.710999,-1.197005c0,-0.699005 -0.710999,-1.197998 -0.710999,-1.197998z" fill="#e73137"/></g></svg>';
	var pauseIcon = '<?xml version="1.0"?><svg width="25" height="28" xmlns="http://www.w3.org/2000/svg"><g><rect fill="none" id="canvas_background" height="30" width="27" y="-1" x="-1"/></g><g><path id="svg_2" d="m22.837276,-0.139977l-4.330006,0c-1.208996,0 -2.187986,0.979996 -2.187986,2.201004l0,23.592012c0,1.220978 0.978991,2.20697 2.187986,2.20697l4.330006,0c1.212997,0 2.188004,-0.985992 2.188004,-2.20697l0,-23.592012c0.007996,-1.216003 -0.975006,-2.201004 -2.188004,-2.201004z" fill="#e73137"/>    <path id="svg_3" d="m6.450266,-0.139977l-4.328003,0c-1.210998,0 -2.192993,0.979996 -2.192993,2.201004l0,23.592012c0,1.220978 0.981995,2.20697 2.192993,2.20697l4.328003,0c1.210999,0 2.188004,-0.985992 2.188004,-2.20697l0,-23.592012c0,-1.216003 -0.977005,-2.201004 -2.188004,-2.201004z" fill="#e73137"/></g></svg>';
	var stopIcon = '<?xml version="1.0"?><svg width="28" height="28" xmlns="http://www.w3.org/2000/svg"><g><rect fill="none" id="canvas_background" height="30" width="30" y="-1" x="-1"/></g><g stroke="null" id="icons">    <path stroke="null" id="svg_5" d="m25.931,-0.158004l-23.642997,0.05101c-1.204002,0 -2.188003,0.978989 -2.188003,2.194992l0,23.552993c0,1.21701 0.979004,2.200989 2.188003,2.200989l23.642997,-0.048981c1.204002,0 2.176003,-0.984009 2.176003,-2.203003l0,-23.55101c0.000999,-1.214981 -0.972,-2.196991 -2.176003,-2.196991z" fill="#e73137"/></g></svg>';
	var nextIcon = '<?xml version="1.0"?><svg width="30.8" height="28.3" xmlns="http://www.w3.org/2000/svg"><g><rect fill="none" id="canvas_background" height="30.3" width="32.8" y="-1" x="-1"/></g><g><path id="svg_8" d="m28.38726,0.100507l-4.328003,0c-1.214996,0 -2.187988,0.986008 -2.187988,2.207001l0,10.104004l-19.18701,-11.884995c-1.457001,-0.951004 -2.645996,-0.254013 -2.645996,1.561997l0,24.020996c0,1.812012 1.187988,2.518005 2.645996,1.562012l19.18701,-11.882005l0,10.10399c0,1.223999 0.979004,2.205017 2.187988,2.205017l4.328003,0c1.213013,0 2.187988,-0.981018 2.187988,-2.205017l0,-23.585999c0.002014,-1.218002 -0.97699,-2.207001 -2.187988,-2.207001z" fill="#e73137"/></g></svg>';
	var prevIcon = '<?xml version="1.0"?><svg width="30.7" height="28.2" xmlns="http://www.w3.org/2000/svg"><g><rect fill="none" id="canvas_background" height="30.2" width="32.7" y="-1" x="-1"/></g><g><path id="svg_9" d="m27.895998,0.530002l-19.180999,11.882996l0,-10.103989c0,-1.221008 -0.979004,-2.207001 -2.188995,-2.207001l-4.329987,0c-1.209015,0 -2.188019,0.985993 -2.188019,2.207001l0,23.587998c0,1.223999 0.979004,2.204987 2.188019,2.204987l4.329987,0c1.213013,0 2.188995,-0.980988 2.188995,-2.204987l0,-10.104004l19.180999,11.882996c1.457003,0.953003 2.645998,0.256012 2.645998,-1.561981l0,-24.023011c0.002014,-1.813003 -1.188995,-2.516998 -2.645998,-1.561005z" fill="#e73137"/></g></svg>';
	switch(type){
		case "play":
			return generateIcon(playIcon, color);
		case "pause":
			return generateIcon(pauseIcon, color);
		case "stop":
			return generateIcon(stopIcon, color);
		case "next":
			return generateIcon(nextIcon, color);
		case "prev":
			return generateIcon(prevIcon, color);
	}
}

function generateIcon(icon, color) {
	return color != null
		? icon.replace(/#e73137/g, color)
		: icon;
}
