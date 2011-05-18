
	var _refresh 	= null;
	//var _since_id 	= null;
	
	try { console.log(''); } catch(e) { console = { log: function() {}}; }

	YUI({
	    modules: {
	        'gallery-jsonp': {
	            fullpath: 'http://yui.yahooapis.com/gallery-2010.02.10-01/build/gallery-jsonp/gallery-jsonp-min.js',
	            requires: ['get','oop'],
	            optional: [],
	            supersedes: []
	      },
	        'gallery-yql': {
	            fullpath: 'http://yui.yahooapis.com/gallery-2010.01.27-20/build/gallery-yql/gallery-yql-min.js',
	            requires: ['get','event-custom'],
	            optional: [],
	            supersedes: []
	      }
	

	    }
	}).use('node', 'io-base', 'json', 'selector-css3', 'anim-base', 'gallery-jsonp', 'gallery-yql', function(Y) {
		
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
		
		function refreshState() {
			newState();
		}
		
		function newState() {
			
			var timeline = getHashStringParameter('timeline');
			if (timeline) {
				loadTimeline(timeline, where);
			}
			
			var query = getHashStringParameter('query');
			if (query) {
				loadSearch(query);
			}
		}
		
		var timeline = {
			lowestTweetId : function() {
				var tweet_id = 9999999999999999;

				Y.all(".tweet").each(function(tweet){
					var id = tweet.get('id').replace("tweetid-", "");
					if (id < tweet_id)
					{
						tweet_id = id;
					}
				});

				return tweet_id;
			},
			highestTweetId : function() {
				var tweet_id = 1;

				Y.all(".tweet").each(function(tweet){
					var id = tweet.get('id').replace("tweetid-", "");
					if (id > tweet_id)
					{
						tweet_id = id;
					}
				});

				return tweet_id;
			},
			size : function() {
				return Y.all(".tweet").size();
			},
			
			create : function() {
				Y.one("#timeline").set("innerHTML", "<span id='link-load-more'>More</span");
			},
			
			prepend : function() {
				
				if (timelineInfo.size() > 0)
				{
				}
				else
				{
				}

			}
			
			append : function() {
				
					Y.one("#timeline").append("<div>Timeline " + new Date().getTime() + "</div>");
					var where = {"field" : "max_id", "value" : timelineInfo.lowestTweetId()};
			}
		};
		
		
		function YQL(yql, params){
			params.method 	= "GET";
			params.data 	= "yql=" + escape(yql);
			Y.io("yql.php", params);
		}
		
		function loadTimeline(timeline, where) {
			var yql = null;
			
			switch(timeline) {
				default:
					yql = false;
					break;
					
				case "home":
					yql = 'SELECT * FROM twitter.status.timeline.friends 	WHERE ' + where.field + ' = ' + where.value + ' AND #oauth#;';
					break;
					
				case "sent":
					yql = 'SELECT * FROM twitter.status.timeline.user 		WHERE ' + where.field + ' = ' + where.value + ' AND #oauth#;';
					break;

				case "dmin":	
					yql = 'SELECT * FROM twitter.directmessages 			WHERE ' + where.field + ' = ' + where.value + ' AND #oauth#;';
					break;

				case "dmout":	
					yql = 'SELECT * FROM twitter.directmessages.sent 		WHERE ' + where.field + ' = ' + where.value + ' AND #oauth#;';
					break;
					
					
					
					
					
				/*
				case "mentions":
				yql = 'SELECT * FROM twitter.status.mentions WHERE #oauth#;';
				break;
					
				case "retweets":	
				yql = 'SELECT * FROM twitter.status.retweets WHERE id="derek";';
					break;

				case "public":
					yql = 'SELECT * FROM twitter.status.timeline.public WHERE #oauth#;';
				break;

				case "favorites":	
					yql = 'SELECT * FROM twitter.favorites WHERE #oauth#;';
				
					break;
					*/
			}
			
			if (yql)
			{
				
				YQL(yql, {
					on: {
						start: function(){
							console.log("xhr:start - yql = " + yql);
						},
						complete: function(id, response, args){
							
							console.log("xhr:complete");
							var response = Y.JSON.parse(response.responseText);
							var tweets = [];
						    
						
							if (response.error) {
								errorHandler(response.error);
							}
							else {
								if(response.results)
								{
									if (response['direct-messages'])
									{
										tweets = response['results']['direct-messages']['direct_message'];
									}
									else
									{
										if (response.results.statuses.status.reverse) { // Test to see if it is an array
											tweets = response.results.statuses.status;
										} else {
											tweets = [response.results.statuses.status]; // No? Make it one.
										}
									}
								}

								tweets = tweets.reverse();
								resetState();
								//tweetHandler(tweets);
							}
						},
						end: function(){
							console.log("xhr:end");
						},
					}
				})
			}
			else
			{
				loadTimelineOld(timeline);
			}
		}
		
		function loadTimelineOld(timeline, refresh) {
			var refresh  = refresh || false;
			var url = null;
			
			switch(timeline) {
				default:
				case "home":
					url = 'http://www.twitter.com/statuses/home_timeline.json';
					http_method = "GET";
					break;

				case "mentions":
					url = 'http://www.twitter.com/statuses/replies.json';
					http_method = "GET";
					break;

				case "retweets":
					url = 'http://api.twitter.com/1/statuses/retweets_of_me.json';
					http_method = "GET";
					break;

				case "sent":
					url = 'http://www.twitter.com/statuses/user_timeline.json';
					http_method = "GET";
					break;

				case "public":
					url = 'http://www.twitter.com/statuses/public_timeline.json';
					http_method = "GET";
					break;

				case "favorites":
					url = 'http://www.twitter.com/favorites.json';
					http_method = "GET";
					break;

				case "dmin":
					url = 'http://www.twitter.com/direct_messages.json';
					http_method = "GET";
					break;

				case "dmout":
					url = 'http://www.twitter.com/direct_messages/sent.json';
					http_method = "GET";
					break;
			}
			
			url = "/proxy.php?url=" + url;
			
			
			if (refresh)
			{
				Y.all(".tweet").each(function(tweet){
					id = tweet.get('id').replace("tweetid-", "");
					if (id > _since_id)
					{
						_since_id = id;
					}
				});
			}
			else
			{
				_since_id = 1;
			}
			
			console.log("All tweets since " + _since_id);
			
			Y.io(url, {
				method: http_method,
				data: "since_id=" + _since_id,
				on: {
					start: function(){
						console.log("xhr:start - url:" + url);
						if (refresh === false)
							Y.one("#timeline").setContent("Loading...");
					},
					complete: function(id, response, args){
						console.log("xhr:complete");
						response = Y.JSON.parse(response.responseText);
					    if (response.error) {
							errorHandler(response.error);
						}
						else {
							console.log("Got (" + response.length + ") tweets");
							
							if (refresh === false)
							{
								Y.one("#timeline").set("innerHTML", "");
							}
							response = response.reverse();
							resetState();
							tweetHandler(response);
						}
					},
					end: function(){
						console.log("xhr:end");
					},
				}
			})
			
			//Y.one("#timeline").setContent(window.location.hash);
		}
		
		function loadSearch(query) {
			var yql = ("SELECT * FROM twitter.search WHERE q='" + (query) + "';");
		    new Y.yql(yql, function(response) {
			console.log(response);
				if (response.error) {
					errorHandler(response.error);
				}
				else {
					if (response.query.results) {
						Y.one("#timeline").set("innerHTML", "");
						tweets = response.query.results.results.reverse();
						resetState();
						tweetHandler(tweets);
					}
					else {
						
						Y.one("#timeline").set("innerHTML", "No results");
					}
				}
		    });
		
		}
		
		function getRateLimitStatus() {
			var url = "http://twitter.com/account/rate_limit_status.json";
			url = "/proxy.php?url=" + url;
			
			Y.io(url, {
				method: "GET",
				on: {
					start: function(){
						console.log("xhr:start - url:" + url);
					},
					complete: function(id, response, args){
						console.log("xhr:complete");
						response = Y.JSON.parse(response.responseText);
					    if (response.error) {
							errorHandler(response.error);
						}
						else {
							Y.one("#rate-remaining-hits").set("innerHTML", response.remaining_hits );
							Y.one("#rate-reset-time").set("innerHTML", response.reset_time );
						}
					},
					end: function(){
						console.log("xhr:end");
					},
				}
			});
			
		}
		
		
		
		
		function tweetHandler(tweets) {
			var hidden = "";
			
			if (Y.all(".tweet").size() > 0) {
				hidden = "hidden";
			}
			else {
				Y.one("#timeline").set("innerHTML", "<span id='link-load-more'>More</span");
			}
			
			Y.one("#timeline").prepend("<hr />");
			for(i in tweets)
			{
				var html = [];
				var tweet = new Tweet(tweets[i]);
				//console.log(tweet);
				Y.one("#timeline").prepend(tweet.asHtml(hidden));
			}
		}
		
		function resetState() {
			clearTimeout(_refresh);
			_refresh = setTimeout(refreshState, 60000);
			Y.one("#countdown").set("innerHTML", "60");
		}
		
		function refreshHandler() {
			refreshState();
			resetState();
		}
		
		function errorHandler(message) {
			alert("Error: " + message);
		}
		
		function pauseHandler(){
			if (Y.one("#link-pause").get("innerHTML") == "Off")
			{
				Y.one("#link-pause").setContent("On");
			}
			else
			{
				Y.one("#link-pause").setContent("Off");
			}
		}
		
		function stopHandler() {
			Y.one("#link-stop").setContent("Stopped");
			clearTimeout(_refresh);
		}
		
		function userHandler(e){
			var username = Y.one(e.target).get("innerHTML");
			var url = "http://twitter.com/users/show.json";
			url = "/proxy.php?url=" + url;

			Y.io(url, {
				method: "GET",
				data: "screen_name=" + username,
				on: {
					start: function(){
						console.log("xhr:start - url:" + url);
					},
					complete: function(id, response, args){
						console.log("xhr:complete");
						response = Y.JSON.parse(response.responseText);
					    if (response.error) {
							errorHandler(response.error);
						}
						else {
							var user = response;
							var html = [];
							
							html.push("<div><img src='http://img.tweetimag.es/i/" + user.screen_name + "_o' alt='" + user.screen_name + "' width='250' /></div>");
							html.push("<p><span class='bold'>Username</span> <span id='username'>" + user.screen_name  + "</span></p>");
							html.push("<p><span class='bold'>Name</span> " + user.name  + "</p>");
							html.push("<p><span class='bold'>Location</span> " + user.location  + "</p>");
							html.push("<p><span class='bold'>Web</span> <a href='" + user.url  + "' target='_blank'>" + user.url  + "</a></p>");
							html.push("<p><span class='bold'>Bio</span> " + user.description  + "</p>");
							html.push("<p><span class='bold'>Followers</span> " + user.followers_count  + "</p>");
							html.push("<p><span class='bold'>Following</span> " + user.friends_count  + "</p>");
							html.push("<p><span class='bold'>Updates</span> " + user.statuses_count  + "</p>");
							html.push("<p>&nbsp;</p>");
							html.push("<p>" + user.status.text + "</p>");
							html.push("<p>&nbsp;</p>");
							html.push("<p><a href='#query=from:" + user.screen_name + "'>View " + user.screen_name + "'s Tweets</a></p>");
							html.push("<p><a href='#query=to:" + user.screen_name + "'>View " + user.screen_name + "'s Mentions</a></p>");
							html.push("<p><a href='http://twitter.com/" + user.screen_name + "'>View " + user.screen_name + "'s Twitter Page</a></p>");
							html.push("<div id='friendship-detail'><span class='link-friendship pseudolink'>See Friendship Info</span></div>");
							html = html.join('');
							
							Y.one("#sidebox .inner").setContent(html);
							Y.one("#sidebox").removeClass("hidden");
						}
					},
					end: function(){
						console.log("xhr:end");
					},
				}
			});
		}

		
		function friendshipHandler(e){
			var username = Y.one("#sidebox #username").get("innerHTML") ;
			var url = "http://api.twitter.com/1/friendships/show.json";
			url = "/proxy.php?url=" + url;

			Y.io(url, {
				method: "GET",
				data: "target_screen_name=" + username,
				on: {
					start: function(){
						console.log("xhr:start - url:" + url);
					},
					complete: function(id, response, args){
						console.log("xhr:complete");
						response = Y.JSON.parse(response.responseText);
					    if (response.error) {
							errorHandler(response.error);
						}
						else {
							var relationship = response.relationship;
							var html = [];
							
							html.push("<p>");
							if (relationship.source.following == true)
							{
								html.push("<span class='link-follow pseudolink' x-username='" + relationship.target.screen_name + "'>Unfollow</span>");
							}
							else
							{
								html.push("<span class='link-follow pseudolink' x-username='" + relationship.target.screen_name + "'>Follow</span>");
							}
							html.push("</p>");									

							html.push("<p> " + relationship.target.screen_name + " is ");
							if (relationship.source.followed_by == false)
							{
								html.push("not ");
							}
							html.push("following you.");
							html.push("</p>");
							
							html = html.join('');
							Y.one('#sidebox #friendship-detail').setContent(html);
						}
					},
					end: function(){
						console.log("xhr:end");
					},
				}
			});
		}
		
		function loadMoreHandler() {
			newState();
		}
		
		function modifyFriendship(username, action) {
			if (action == "follow"){
				action = "create";
			} else if (action == "unfollow") {
				action = "destroy";
			}
			
			var url = "http://api.twitter.com/1/friendships/" + action + "/" + username + ".json";

			Y.io("/proxy.php", {
				method: "POST",
				data: "url=" + url,
				on: {
					start: function(){
						console.log("xhr:start - url:" + url);
					},
					complete: function(id, response, args){
						console.log("xhr:complete");
						response = Y.JSON.parse(response.responseText);
					    if (response.error) {
							errorHandler(response.error);
						}
						else {
							//console.log(response);
						}
					},
					end: function(){
						console.log("xhr:end");
					},
				}
			});
		}
		
		
		function followHandler(e) {
			var username = e.target.getAttribute("x-username");
			if (e.target.get("innerHTML") == "Unfollow") {
				e.target.setContent("Follow");
				modifyFriendship(username, "unfollow")
			}
			else {
				e.target.setContent("Unfollow");
				modifyFriendship(username, "follow")
			}	
		}
		
		function closeSideboxHandler() {
			Y.one("#sidebox").addClass("hidden");
		}
		
		
		
		
		
		
		// Load the initial state and loop to detect any URL Hash changes
		newState();
		(function () {
			lastHash = location.hash;
			return setInterval(function() {
			    if(lastHash !== location.hash) {
					Y.one("#timeline").get('children').remove(true);
			    	lastHash = location.hash;
					newState();
			    }
			}, 50);
		})();
		
		// Handle the "Next Update" countdown timer
		setInterval(function(){
			var current = Y.one("#countdown").get("innerHTML");
			current = parseInt(current);
			Y.one("#countdown").set("innerHTML", current-1);
		}, 1000);

		// Show any hidden tweets
		setInterval(function(){
			if (Y.all(".tweet.hidden").size() > 0)
			{
				var tweet = Y.all(".tweet.hidden").item(Y.all(".tweet.hidden").size()-1); // Pop off the last tweet
				tweet.removeClass("hidden");
			}
		},750);
		
		setTimeout(getRateLimitStatus, 2000); // Delay the first load
		setInterval(getRateLimitStatus, 42000);
		
		Y.on('click', pauseHandler, '#link-pause');
		Y.on('click', stopHandler, '#link-stop');
		Y.on('click', refreshHandler, '#link-refresh');
		Y.on('click', closeSideboxHandler, '#link-close-sidebox');
		Y.on('click', loadMoreHandler, '#link-load-more');
		
		Y.delegate('click', friendshipHandler, '#sidebox', '.link-friendship');
		Y.delegate('click', followHandler, '#sidebox', '.link-follow');
		Y.delegate('click', userHandler, '#timeline', '.username');
		
	}); //End YUI





	/** !!!Outside YUI Scope!!! **/
	
	
	function Tweet(tweet)
	{
		if (tweet.iso_language_code) // Comes from search
		{
			tweet.user_profile_image_url = tweet.profile_image_url;
			tweet.user_screen_name = tweet.from_user;
			
			values = tweet.created_at.split(" ");
			tweet.created_at = Date.parse(values[2] + " " + values[1] + ", " + values[3] + " " + values[4]);
		}
		else if (tweet.sender)
		{
			tweet.user_profile_image_url = tweet.sender.profile_image_url;
			tweet.user_screen_name = tweet.sender.screen_name;
		}
		else
		{
			tweet.user_profile_image_url = tweet.user.profile_image_url;
			tweet.user_screen_name = tweet.user.screen_name;
		
			values = tweet.created_at.split(" ");
			tweet.created_at = Date.parse( values[1] + " " + values[2] + ", " + values[5] + " " + values[3]);
		}	
		
		tweet.created_at = relative_time(tweet.created_at)
		
		return {
			asHtml : function(hidden){
				var html = [];
				var hidden = hidden || '';
				
				tweet.text = tweet.text.replace(/((ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?)/gi,'<a href="$1" target="_blank">$1<\/a>');
				tweet.text = tweet.text.replace(/@([a-zA-Z0-9_]+)/gi,'<span class="pseudolink username">@$1<\/span>');
				tweet.text = tweet.text.replace(/#([a-zA-Z0-9_]+)/gi,'<a class="query" href="#query=#$1">#$1<\/a>');
				
				html.push("<div class='tweet " + hidden + "' id='tweetid-" + tweet.id + "'>");
				html.push("		<div>");
				html.push("			<a class='tweet-image' href=''><img src='" + tweet.user_profile_image_url + "' height='50' width='50'></a>");
				html.push("		</div>");
				html.push("		<div class='tweet-body'>");
				html.push("			<span class='pseudolink username'>" + tweet.user_screen_name + "</span>");
				html.push(": ");
				html.push(tweet.text);
				html.push("		<div class='tweet-footer'>");
				html.push(tweet.created_at);
				html.push("		</div>");
				html.push("		</div>");
				html.push("		<div style='clear:both'></div>");
				html.push("</div>");
				
				html = html.join('');
				
				return html;
			}
		}
	}

	function relative_time(parsed_date)
	{
		var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
		var delta = parseInt((relative_to.getTime() - parsed_date) / 1000);  
		delta = delta + (relative_to.getTimezoneOffset() * 60);

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


	window.onscroll = function()
	{
		var offset = 30;
		if( window.XMLHttpRequest ) {
			if (document.documentElement.scrollTop > offset || self.pageYOffset > offset) {
				document.getElementById('sidebox').style.position = 'fixed';
				document.getElementById('sidebox').style.top = 0;
			} else if (document.documentElement.scrollTop < offset || self.pageYOffset < offset) {
				document.getElementById('sidebox').style.position = 'absolute';
				document.getElementById('sidebox').style.top = offset + 'px';
			}
		}
	}