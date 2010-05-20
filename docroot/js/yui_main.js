"use strict";

/*global
	getHashStringParameter: true,
	relative_time: true,
	updateStatus: true
	window: true,
	YUI: true,
*/

YUI({
	//combine: true,
	modules: {
		'gallery-yql': {
			fullpath: 'http://yui.yahooapis.com/gallery-2010.01.27-20/build/gallery-yql/gallery-yql-min.js',
			requires: ['get', 'event-custom'],
			optional: [],
			supersedes: []
		},
		'Bucket': {
			fullpath: '/js/bucket.js'
		},
		'List': {
			fullpath: '/js/list.js'
		},
		'Timeline': {
			fullpath: '/js/timeline.js'
		},
		'Tweet': {
			fullpath: '/js/tweet.js'
		},
		'Twitter': {
			fullpath: '/js/twitter.js',
			requires: ['io-base', 'yql', 'json']
		},
		'User': {
			fullpath: '/js/user.js'
		},
		'yql': {
			fullpath: '/js/yql.js'
		}
	}
}).use('node', 'dom', 'event', 'Timeline', 'Bucket', 'Tweet', 'Twitter', 'User', 'List',  function (Y) {

	var allowUpdate;
	
	allowUpdate = true;
	
	function newState() {
		var i, config, state, Timeline, timelineCount;
		
		config = {};
		state = null;
		Timeline = {};
		timelineCount = window.Timelines.length;
		
		for (i = 0; i < timelineCount; i = i + 1) {
			window.Timelines[i].destroy();
			window.Timelines.splice(i, 1); // Splice, instead of delete, to not leave any holes in the array.
		}
		
		if ((config.timeline = getHashStringParameter('timeline'))) {
			config.type = "timeline";
		}
		else if ((config.query = getHashStringParameter('query'))) {
			//query = Y.one("#search-box input[type=text]").get("value");
			config.type = "search";
		}
		else if ((config.list = getHashStringParameter('list'))) {
			config.type = "list";
		}
		/*else if ((config.login = getHashStringParameter('login'))) {
			Y.Twitter.call({type: "request_token"}, function(token){
				window.location = "https://twitter.com/oauth/authenticate?" + token;
			})
		}*/
		else {
			throw ("Unknown state");
		}
		if (config.type) {
			Timeline = Object.create(Y.Timeline);
			Timeline.init(config);

			window.Timelines.push(Timeline);
		}
	}
	
	// Load the initial state and loop to detect any URL Hash changes
	setTimeout(newState, 100);
	(function () {
		var lastHash = location.hash;
		if (lastHash === '') {
			window.location.hash = "#timeline=home";
		}
		
		return setInterval(function () {
		    if (lastHash !== location.hash) {
				lastHash = location.hash;
				newState();
		    }
		}, 200);
	}());	
	
	
	// Recalculate timestamps
	setInterval(function (Y) {
		Y.all(".timestamp").each(function (node) {
			node.setContent(relative_time(node.getAttribute('title')));
		});
	}, 60000, Y); // Once per minute


	// Load in the user's lists
	(function () {
		var request;
		
		request = {};
		request.type = "lists";
		
		Y.Twitter.call(request, function (lists) {
			var html, i, List;
			
			html = '';
			
			for (i in lists) {
				if (lists.hasOwnProperty(i)) {
					List = Object.create(Y.List);
					List.init(lists[i]);
					html += List.asHtml();
			    }
			}
			Y.one("#lists").setContent(html);
		});
	}());

	// Load in the user's saved searches
	(function () {
		Y.Twitter.call({type: "saved_searches"}, function (searches) {
			var i, html;
			
			html = '';
			
			for (i in searches) {
				if (searches.hasOwnProperty(i)) {
					html += "<li><a href='#query=" + encodeURIComponent(searches[i].query) + "'>" + searches[i].name + "</li>";
			    }
			}
			
			Y.one("#saved-searches").setContent(html);
		});
	}());


	// Check on the rate limiting
	function checkRateLimitStatus() {
		Y.Twitter.call({type: "rate_limit_status"}, function (response) {
			var current_timestamp, minutes_till_reset, seconds_till_reset;
			
			current_timestamp = Math.round(new Date().getTime() / 1000);
			seconds_till_reset = response['reset-time-in-seconds'].content - current_timestamp;
			minutes_till_reset = Math.round(seconds_till_reset / 60);
			
			Y.one("#rate-reset-time").setContent(minutes_till_reset);
			Y.one("#rate-remaining-hits").setContent(response['remaining-hits'].content);
		});
	}
	
	setTimeout(checkRateLimitStatus, 2000); // Delayed a bit after page load
	setInterval(checkRateLimitStatus, 75123); // Every 75 seconds, staggered
	
	
	// reset the trends
	function resetTrends() {
		Y.Twitter.call({type: "trends"}, function (trends) {
			var html, i;
			
			html = '';
			
			for (i in trends) {
				if (trends.hasOwnProperty(i)) {
					html += "<li><a href='#query=" + encodeURIComponent(trends[i].query) + "'>" + trends[i].name + "</li>";
			    }
			}
			
			Y.one("#trends").setContent(html);
		});
	}
	resetTrends();
	setInterval(resetTrends, 60000 * 5); // Every 5 minutes


	function recalculateStatusCharCount() {
		var status;
		
		status = Y.one("#compose-status").get("value");
		Y.one("#character-count").setContent(140 - status.length);
	}
	document.getElementById("compose-status").onkeyup = recalculateStatusCharCount;
	
	
	function closeSideboxHandler() {
		Y.one("#sidebox").addClass("hidden");
	}
	
	
	function updateStatus(status, callback) {
		Y.Twitter.call({type: "update", status: status}, function (response) {
			callback(response);
		});		
	}
	
	function updateStatusHandler() {
		var status;
		
		status = Y.one("#compose-status").get("value");
		
		updateStatus(status, function (response) {
			Y.one("#compose-status").set("value", "");
			recalculateStatusCharCount();
		});
	}
	
	function userHandler(e) {
		var User;
		
		Y.one("#sidebox .inner").setContent("Loading...");
		Y.one("#sidebox").removeClass("hidden");
		
		User = Object.create(Y.User);
		User.init({username: Y.one(e.target).get("innerHTML")});

		User.load(function (U) {
			Y.one("#sidebox .inner").setContent(U.asHtml());
		});
	}
	
	function searchHandler(e) {
		window.location.hash = '#query=' + Y.one("#search-box input[type=text]").get("value");
	}
	
	function searchBoxHandler(e) {
		if (e.type === "focus") {
			e.target.set("value", "").setStyle("color", "#000000");
		}
		else if (e.type === "blur" && e.target.get("value") === "") {
			e.target.set("value", "Twitter Search").setStyle("color", "#999999");
		}
	}
	
	function replyHandler(e) {
		var html, in_reply_to, username;
		
		in_reply_to = Y.one(e.target).ancestor(".tweet").get("id").replace("tweetid-", "");
		username = Y.one(e.target).ancestor(".tweet").one(".username").get("innerHTML");
		
		html = [];
		html.push("<div>");
		html.push("	 <textarea class='text-reply' id='reply-to-" + in_reply_to + "' style='width:400px; height:50px;'>@" + username + " </textarea>");
		html.push("	 <input type='button' class='button-submit-reply' value='send'>");
		html.push("	 <span class='pseudolink link-cancel-reply'>cancel</span>");
		html.push("</div>");
		html = html.join('');
		
		Y.one(e.target).ancestor(".tweet").one(".tweet-extra").setContent(html);
	}
	
	function retweetHandler(e) {
		var text, username;
		
		username = Y.one(e.target).ancestor(".tweet").one(".username").get("innerHTML");
		text = Y.one(e.target).ancestor(".tweet").one(".raw-text").get("innerHTML");
		
		Y.one("#compose-status").set("value", "RT @" + username + ": " + text);
		
		recalculateStatusCharCount();
	}
	
	function cancelReplyHandler(e) {
		Y.one(e.target).ancestor(".tweet-extra").get('children').remove(true);
	}

	function sendReplyHandler(e) {
		var in_reply_to, status;
		
		status = Y.one(e.target).ancestor(".tweet").one(".text-reply").get("value");
		in_reply_to = Y.one(e.target).ancestor(".tweet").get("id").replace("tweetid-", "");
		
		updateStatus(status, function () {
			Y.one(e.target).ancestor(".tweet-extra").get('children').remove(true);
		});
	}
	
	function unlockUpdating() {
		allowUpdate = true;
	}
	
	Y.on('click', closeSideboxHandler, '#link-close-sidebox');
	Y.on('click', updateStatusHandler, '#update-status');
	Y.on('click', searchHandler, '#search-box input[type=button]');
	Y.on('focus', searchBoxHandler, '#search-box input[type=text]');
	Y.on('blur',  searchBoxHandler, '#search-box input[type=text]');
	
	Y.delegate('click', userHandler, '#timeline', '.username');
	Y.delegate('click', replyHandler, '#timeline', '.link-reply');
	Y.delegate('click', retweetHandler, '#timeline', '.link-retweet');
	Y.delegate('click', cancelReplyHandler, '#timeline', '.link-cancel-reply');
	Y.delegate('click', sendReplyHandler, '#timeline', '.button-submit-reply');

	window.onscroll = function () {
		var st, wh, coverage, docHeight, t, where, offset;

		/* <auto-update> */
	    st = (document.documentElement.scrollTop || document.body.scrollTop);
	    wh = (window.innerHeight && window.innerHeight < Y.DOM.winHeight()) ? window.innerHeight : Y.DOM.winHeight();

		coverage = st + wh;
		docHeight = Y.DOM.docHeight();

		if (coverage >= (docHeight - 0) && allowUpdate) {
			t = window.Timelines[0];
			where = {
				field : "max_id",
				value : t.lowestTweetId() - 1
			};
			t.addBucket("append").getTweets(t.config, where);

			allowUpdate = false;
			setTimeout(unlockUpdating, 3000);
		}
		/* </auto-update> */

		/* <sticky sidebox> */
		offset = 30;
		if (window.XMLHttpRequest) {
			//Moving
			if (document.documentElement.scrollTop > offset || window.pageYOffset > offset) {
				document.getElementById('sidebox').style.position = 'fixed';
				document.getElementById('sidebox').style.top = 0;
			} 
			// At top
			else if (document.documentElement.scrollTop < offset || window.pageYOffset < offset) {
				document.getElementById('sidebox').style.position = 'absolute';
				document.getElementById('sidebox').style.top = offset + 'px';
			}
		}
		/* </sticky sidebox> */
	};
	
});