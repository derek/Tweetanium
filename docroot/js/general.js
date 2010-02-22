var Timelines = [];

YUI({
	combine: true,
	modules: {
		'gallery-yql': {
			fullpath: 'http://yui.yahooapis.com/gallery-2010.01.27-20/build/gallery-yql/gallery-yql-min.js',
			requires: ['get','event-custom'],
			optional: [],
			supersedes: []
		},
		'Timeline': {
			fullpath: 'http://tweetanium.net/js/timeline.js',
			requires: [],
			optional: [],
			supersedes: []
		},
		'Bucket': {
			fullpath: 'http://tweetanium.net/js/bucket.js',
			requires: [],
			optional: [],
			supersedes: []
		},
		'Tweet': {
			fullpath: 'http://tweetanium.net/js/tweet.js',
			requires: [],
			optional: [],
			supersedes: []
		},
		'Twitter': {
			fullpath: 'http://tweetanium.net/js/twitter.js',
			requires: ['io-base', 'gallery-yql', 'json'],
			optional: [],
			supersedes: []
		},
	}
}).use('node', 'Timeline', 'Bucket', 'Tweet', 'Twitter', function(Y) {
	
	function newState() {
		var state 	 = null;
		var thing 	 = {};
		var Timeline = {};
		var timelineCount = 0;
		
		timelineCount = Timelines.length;
		for(var i=0; i < timelineCount; i++) {
			Timelines[i].destroy();
			Timelines.splice(i, 1); // Splice, instead of delete, to not leave any holes in the array.
		}
		
		state = getHashStringParameter('timeline');
		if (state) {
			thing.type		= "timeline";
			thing.timeline 	= state
		} else {
			state = getHashStringParameter('query');
			thing.type		= "search";
			thing.query 	= state
		}
		
		Timeline = Object.create(Y.Timeline);
		Timeline.init(thing);
		
		window.Timelines.push(Timeline);
	}
	
	// Recalculate timestamps
	setInterval(function() {
		Y.all(".timestamp").each(function(node){
			node.set("innerHTML", relative_time(node.getAttribute('title')));
		})
	}, 60000);
	
	// Load the initial state and loop to detect any URL Hash changes
	newState();
	(function () {
		var lastHash = location.hash;
		return setInterval(function() {
		    if(lastHash !== location.hash) {
				lastHash = location.hash;
				newState();
		    }
		}, 500);
	})();
	
});


function getHashStringParameter(parameter){
	var queryString = {};
	var parameters  = window.location.hash.substring(1).split('&');
	var pos, paramname, paramval;

	for (var i in parameters) {
		pos = parameters[i].indexOf('=');
		if (pos > 0) {
			paramname = parameters[i].substring(0,pos);
			paramval  = parameters[i].substring(pos+1);
			queryString[paramname] = unescape(paramval.replace(/\+/g,' '));
		}
		else {
			queryString[parameters[i]] = "";
		}
	}
	if (queryString[parameter]) {
		return queryString[parameter];
	}
	else {
		return false;
	}
}

function relative_time(parsed_date) {
	var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
	var delta 		= parseInt((relative_to.getTime() - parsed_date) / 1000) + (relative_to.getTimezoneOffset() * 60);

	if (delta < 60) {
		return 'less than a minute ago';
	} else if(delta < 120) {
		return 'a minute ago';
	} else if(delta < (45*60)) {
		return (parseInt(delta / 60)).toString() + ' minutes ago';
	} else if(delta < (90*60)) {
		return 'an hour ago';
	} else if(delta < (24*60*60)) {
		return '' + (parseInt(delta / 3600)).toString() + ' hours ago';
	} else if(delta < (48*60*60)) {
		return '1 day ago';
	} else {
		return (parseInt(delta / 86400)).toString() + ' days ago';
	}
}