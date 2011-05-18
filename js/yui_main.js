/*global
	getHashStringParameter: true,
	relative_time: true,
	updateStatus: true
	window: true,
	YUI: true,
*/

YUI({
	combine: false,
	filter: "raw",
	debug: false,
	modules: {
        'Bucket': {
        	fullpath: 'js/bucket.js'
        },
        'List': {
        	fullpath: 'js/list.js'
        },
        'Timeline': {
        	fullpath: 'js/timeline.js'
        },
        'Tweet': {
        	fullpath: 'js/tweet.js'
        },
        'Twitter': {
        	fullpath: 'js/twitter.js'
        },
        'User': {
            fullpath: 'js/user.js'
        },
        'myYQL': {
            fullpath: 'js/yql.js',
            requires: ['jsonp', 'jsonp-url']
        }
	}
}).use('node', 'dom', 'event', 'Timeline', 'Bucket', 'Tweet', 'Twitter', 'User', 'List', 'gallery-storage-lite', 'myYQL',  function (Y) {

    "use strict";
	
	var allowUpdate;
	
	allowUpdate = true;
	
	if (getQueryStringParameter('oauth_token')) {
		Y.StorageLite.setItem('oauth_token', getQueryStringParameter('oauth_token'));
		Y.StorageLite.setItem('oauth_verifier', getQueryStringParameter('oauth_verifier'));
		
		Y.Twitter.config({
			oauth_token: getQueryStringParameter('oauth_token'), 
			oauth_token_secret: getQueryStringParameter('oauth_token_secret')
		});

		Y.Twitter.call({type: "access_token"}, function(tokens){
			Y.StorageLite.setItem('oauth_token', tokens.oauth_token);
			Y.StorageLite.setItem('oauth_token_secret', tokens.oauth_token_secret);
			window.location = '//' + window.location.host + window.location.pathname;
		});
	}
	
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
			config.type = "search";
		}
		else if ((config.list = getHashStringParameter('list'))) {
			config.type = "list";
		}
		else if ((config.login = getHashStringParameter('login'))) {
			Y.Twitter.call({type: "request_token"}, function(tokens){
				Y.log("step 1");
				Y.log(tokens);
				Y.StorageLite.setItem('oauth_token', tokens.oauth_token);
				Y.StorageLite.setItem('oauth_token_secret', tokens.oauth_token_secret);
				window.setTimeout(function() {
					window.location = "https://twitter.com/oauth/authenticate?oauth_token=" + tokens.oauth_token + "&oauth_token_secret=" + tokens.oauth_token_secret;
				}, 10);
			});
		}
		else if ((config.list = getHashStringParameter('logout'))) {
			Y.StorageLite.clear();
			window.location = '//' + window.location.host + window.location.pathname;
		}
		else {
			throw ("Unknown state");
		}
		if (config.type) {
			Timeline = Object.create(Y.Timeline);
			Timeline.init(config);

			window.Timelines.push(Timeline);
		}
	}
	
	
	window.onhashchange = newState;
	
	if (window.location.hash === '') {
		window.location.hash = "#timeline=home";
	}
	else {
		newState();
	}

	// Recalculate timestamps
	setInterval(function (Y) {
		Y.all(".timestamp").each(function (node) {
			node.setContent(relative_time(node.getAttribute('title')));
		});
	}, 60000, Y); // Once per minute
	
	
	
	function renderLoggedOutUI() {
		Y.one("#sidenav-login").setStyle('display', 'block');
	}
	
	
	function renderLoggedInUI() {
		// Load in the user's lists
		Y.Twitter.call({type:"lists"}, function (lists) {
			Y.Twitter.call({type:"list_subscriptions"}, function (subscriptions) {
				var html='', i, List;
				//Y.log(lists);
				//Y.log(subscriptions);
				// Merge the lists
				lists = lists.concat(subscriptions);
				
				// Now sort them
				lists.sort(function compare(a,b) {
					if (a.name.toLowerCase() < b.name.toLowerCase()){
						return -1;
					}
					if (a.name.toLowerCase() > b.name.toLowerCase()){
						return 1;
					}
					return 0;
				});
				
				for (i in lists) {
					if (lists.hasOwnProperty(i)) {
						List = Object.create(Y.List);
						List.init(lists[i]);
						html += List.asHtml();
				    }
				}
				
				Y.one("#lists").setContent(html);
				
				Y.one("#sidenav-lists").setStyle('display', 'block');
			});
		});
		
		// Load in the user's saved searches
		Y.Twitter.call({type: "saved_searches"}, function (searches) {
			var i, html;

			html = '';

			for (i in searches) {
				if (searches.hasOwnProperty(i)) {
					html += "<li><a href='#query=" + encodeURIComponent(searches[i].query) + "'>" + searches[i].name + "</li>";
			    }
			}

			Y.one("#saved-searches").setContent(html);
			Y.one("#sidenav-saved-searches").setStyle('display', 'block');
		});


		// Check on the rate limiting
		function checkRateLimitStatus() {
			Y.Twitter.call({type: "rate_limit_status"}, function (response) {
				var current_timestamp, minutes_till_reset, seconds_till_reset;

				current_timestamp = Math.round(new Date().getTime() / 1000);
				seconds_till_reset = response['reset-time-in-seconds'].content - current_timestamp;
				minutes_till_reset = Math.round(seconds_till_reset / 60);

				Y.one("#rate-reset-time").setContent(minutes_till_reset);
				Y.one("#sidenav-rate-stats").setStyle('display', 'block');
				Y.one("#rate-remaining-hits").setContent(response['remaining-hits'].content);
			});
		}

		setTimeout(checkRateLimitStatus, 2000); // Delayed a bit after page load
		setInterval(checkRateLimitStatus, 75123); // Every 75 seconds, staggered
	}
	
	if(Y.StorageLite.getItem('oauth_token') != null) {
		Y.Twitter.config({
			oauth_token: Y.StorageLite.getItem('oauth_token'), 
			oauth_token_secret: Y.StorageLite.getItem('oauth_token_secret')
		});
		Y.Twitter.call({type: "credentials"}, function(user){
			Y.Twitter.config({
				screen_name: user.screen_name, 
				user_id: user.id
			});
			
			dynaCSS("body{ background: url(" + user.profile_background_image_url + ") fixed no-repeat #" + user.profile_background_color + "; } ");
			dynaCSS("a, .pseudolink {color: #" + user.profile_link_color + "}");
			
			Y.one("#profile_image_url").setAttribute('src', user.profile_image_url);
			Y.one("#sidenav-timelines").setStyle('display', 'block');
			Y.one("#update-status-wrapper").setStyle('display', 'block');
			renderLoggedInUI();
		});
		
	}
	else {
		renderLoggedOutUI();
	}
	
	
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
			Y.one("#sidenav-trends").setStyle('display', 'block');
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
	
	function favoriteHandler(e) {
		var tweet_id;
		
		tweet_id = Y.one(e.target).ancestor(".tweet").get("id").replace("tweetid-", '');
		
		Y.Twitter.call({type: "favorite_create", tweet_id: tweet_id}, function (response) {
			//callback(response);
		});
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

    function showBucketHandler(e) {
        Y.one(e.target).ancestor(".bucket").get('children').toggleClass('hidden');
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
	Y.delegate('click', favoriteHandler, '#timeline', '.link-favorite');
	Y.delegate('click', cancelReplyHandler, '#timeline', '.link-cancel-reply');
	Y.delegate('click', sendReplyHandler, '#timeline', '.button-submit-reply');
	Y.delegate('click', showBucketHandler, '#timeline', '.link-show-bucket');

	window.onscroll = function () {
		var st, wh, coverage, docHeight, t, where, offset;

		/* <auto-update> */
        st = (document.documentElement.scrollTop || document.body.scrollTop);
        wh = (window.innerHeight && window.innerHeight < Y.DOM.winHeight()) ? window.innerHeight : Y.DOM.winHeight();

		coverage = st + wh;
		docHeight = Y.DOM.docHeight();

		if (coverage >= (docHeight - 50) && allowUpdate) {
			t = window.Timelines[0];
			where = {
				max_id : t.lowestTweetId() - 1
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
	
	function dynaCSS(styles) {
		var ss1 = document.createElement('style');
		ss1.setAttribute("type", "text/css");
		if (ss1.styleSheet) {   // IE
		    ss1.styleSheet.cssText = styles;
		} else {                // the world
		    var tt1 = document.createTextNode(styles);
		    ss1.appendChild(tt1);
		}
		var hh1 = document.getElementsByTagName('head')[0];
		hh1.appendChild(ss1);
		
	}
	
});