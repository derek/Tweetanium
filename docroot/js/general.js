YUI({
	modules: {
		'tweetanium-bucket': {
			fullpath: 	'http://tweetanium.net/js/bucket.js',
			requires: 	['node'],  
			optional: 	[],  
			supersedes: []
		},
		'tweetanium-timeline': {
			fullpath: 'http://tweetanium.net/js/timeline.js',
			requires: 	['node'],  
			optional: 	[],  
			supersedes: []
		},
		'tweetanium-tweet': {
			fullpath: 'http://tweetanium.net/js/tweet.js',
			requires: 	['node'],  
			optional: 	[],  
			supersedes: []
		},
        'gallery-yql': {
            fullpath: 'http://yui.yahooapis.com/gallery-2010.01.27-20/build/gallery-yql/gallery-yql-min.js',
            requires: ['get','event-custom'],
            optional: [],
            supersedes: []
      }
	}
}).use('node', 'io-base', 'json', 'tweetanium-bucket', 'tweetanium-timeline', 'tweetanium-tweet', 'gallery-yql', function(Y) {

	Timelines = [];




	
	
	
	/******** Timeline *********/
	
	var Timeline = {

		init: function(request){
			if (!request) {
				throw new ("Missing request param");
			}
			
			this.active 	= true;
			this.timer 		= 60000;
			this.timelineId = new Date().getTime();
			this.request 	= request;

			console.log("Timeline {" + request.type + " - " + this.timelineId + "} created");

			Y.one("#timeline").get('children').remove(true);

			Y.one("#timeline").append("<div class='inner'></div>");

			N = Y.Node.create("<div id='load-more-bucket-" + this.timelineId + "' align='center' class='pseudolink'>Load More</div>");

			N.on("click", function(e){
				timelineId = e.target.get("id").replace("load-more-bucket-", "");
				var that = getTimeline(timelineId);
				where = {
					field : "max_id",
					value : that.lowestTweetId(),
				};
				getTimeline(timelineId).addBucket("append").getTweets(that.request, where);
			});

			Y.one("#timeline").append(N);
			setTimeout(this.update, 0, this); // TODO: figure out why this works the way it does and the normal way doesn't
			this.beginTimer(this.timer);

			return this;
		},

		destroy: function(){
			console.log("Timeline {" + this.alias + " - " + this.timelineId + "} destroyed");
			clearInterval(this.timer);
			this.active = false;
			return this;
		},

		update: function(that) {
			console.log("Timeline {" + that.alias + " - " + that.timelineId + "} updating...");
			where = {
				field : "since_id",
				value : getTimeline(that.timelineId).highestTweetId(),
			};
			that.addBucket("prepend").getTweets(that.request, where);
		}, 

		beginTimer: function(ms){
			this.timer = setInterval(this.update, ms, this);
		}, 

		addBucket: function(where){
			if (this.active === false)
			{
				throw("Timeline {" + this.alias + "} is dead");
			}

			var B = Object.create(Bucket);
			B.init();
			
			console.log(where + "ing bucketId {" + B.bucketId + "} to timeline {" + this.alias + "}");

			switch(where) {
				case "append" : 
					Y.one("#timeline .inner").append(B.asHtml());
					break;

				case "prepend" :	
					Y.one("#timeline .inner").prepend(B.asHtml());
					break;

				default : 

					break;
			}

			return B;
		},
		
		
		lowestTweetId: function() {
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
		
		highestTweetId: function() {
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
	}
	
	
	
	/******** BUCKET *********/
	
	
	
	
	
	
	
	
	
	var Bucket = {
		bucketId: 0,
		
		init: function() {
			this.bucketId = new Date().getTime();
			console.log("Bucket {" + this.bucketId + "} created");
			return this;
		},
		
		asHtml: function() {
			var html = [];

			html.push("<div style='border:solid black 1px' id='bucketId-{bucketId}'>");
			html.push("<div>BucketID-{bucketId}</div>");
			html.push("<div class='inner'></div>");
			html.push("</div>");

			return html.join('').supplant({
				bucketId: this.bucketId,
			});
		},
		
		getTweets: function(request, where) {
			that = this;
			var Tweets = Twitter.call(request, function(Tweets, context){
				context.addTweets(Tweets);
			}, where, that);
		},
		
		addTweets: function(Tweets) {
			//console.log(Tweets);
			var html = [];

			for(var i in Tweets) {
				html.push(Tweets[i].asHtml());
			}

			html = html.join('');
			Y.one("#bucketId-" + this.bucketId + ' .inner').set("innerHTML", html);
		},
	}
	
	
	
	
	
	
	
	
	
	
	
	/******** TWEET *********/
	
	var Tweet = {
		init: function(data){

			if (data.sender) // Is a DM
			{
				this.user_profile_image_url = tweet.sender.profile_image_url;
				this.user_screen_name = tweet.sender.screen_name;
			}
			else if (data.user) // Is a regular tweet
			{
				this.id 			= data.id;
				this.text			= data.text;
				this.userName 		= data.user.screen_name;
				this.profileImage 	= data.user.profile_image_url;

				values = data.created_at.split(" ");
				this.created_at = relative_time(Date.parse( values[1] + " " + values[2] + ", " + values[5] + " " + values[3]));
			}

			else // Comes from search
			{
				this.id 			= data.id;
				this.text			= data.text;
				this.userName 		= data.from_user;
				this.profileImage 	= data.profile_image_url;

				values = data.created_at.split(" ");
				this.created_at = relative_time(Date.parse(values[2] + " " + values[1] + ", " + values[3] + " " + values[4]));
			}
		},
		asHtml: function() {
			var html = [];

			this.text = this.text.replace(/((ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?)/gi,'<a href="$1" target="_blank">$1<\/a>');
			this.text = this.text.replace(/@([a-zA-Z0-9_]+)/gi,'<span class="pseudolink username">@$1<\/span>');
			this.text = this.text.replace(/#([a-zA-Z0-9_]+)/gi,'<a class="query" href="#query=#$1">#$1<\/a>');

			html.push("<div class='tweet' id='tweetid-{id}'>");
			html.push("		<div>");
			html.push("			<a class='tweet-image' href=''><img src='{profileImage}' height='50' width='50'></a>");
			html.push("		</div>");
			html.push("		<div class='tweet-body'>");
			html.push("			<span class='pseudolink username'>{userName}</span>: {text}");
			html.push("		<div class='tweet-footer'>{created_at}</div>");
			html.push("		</div>");
			html.push("		<div style='clear:both'></div>");
			html.push("</div>");

			html = html.join('').supplant(this);

			return html;
		}
	}
	
	
	
	
	/********* TWITTER OBJECT ********/
	
	
	
	
	var Twitter = {
		call : function(request, callback, where, context) { 
			var Tweets = [];
			if (request.type == "timeline") {
				switch(request.timeline) {
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

					default:
						yql = false;
						throw("Invalid Twitter API method");
						break;
				}
					
			} else {
				yql = 'SELECT * FROM twitter.search WHERE ' + where.field + ' = ' + where.value + ' AND q="' + (request.query) + '";';
			}
			
			YQL(yql, {
				on: {
					start: function(){
					},
					complete: function(id, response, args){
						var response = Y.JSON.parse(response.responseText);
						if (response.error) {
							errorHandler(response.error);
						} else {
							if(response.results)
							{
								if (response['direct-messages'])
								{
									rawTweets = response['results']['direct-messages']['direct_message'];
								}
								else if (response.results.results) 
								{
									if (response.results.results.reverse) { // Test to see if it is an array
										rawTweets = response.results.results;
									} else {
										rawTweets = [response.results.results]; // No? Make it one.
									}
								}
								else
								{
									if (response.results.statuses.status.reverse) { // Test to see if it is an array
										rawTweets = response.results.statuses.status;
									} else {
										rawTweets = [response.results.statuses.status]; // No? Make it one.
									}
								}
								
								for (var i in rawTweets){ 
									T = Object.create(Tweet);
									T.init(rawTweets[i]);
									Tweets.push(T);
								}
								
								callback(Tweets, context);
							}
						}
					},
					end: function(){
					},
				}
			})
		}
	}
	
	


	/*********** OTHER ********/



	function YQL(yql, params){
		params.method 	= "GET";
		params.data 	= "yql=" + escape(yql);
		Y.io("yql.php", params);
	}

	function getTimeline(timelineId){
		for(var i in Timelines) {
			if (Timelines[i].timelineId == timelineId) {
				return Timelines[i];
			}
		}	
	}

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
	
	
	// Load the initial state and loop to detect any URL Hash changes
	(function () {
		lastHash = location.hash;
		return setInterval(function() {
		    if(lastHash !== location.hash) {
				lastHash = location.hash;
				for(var i in Timelines)
				{
					Timelines[i].destroy();
					delete Timelines[i];
				}
				
				var thing = {};
				var timeline = getHashStringParameter('timeline');
				if (timeline) {
					thing.type		= "timeline";
					thing.timeline 	= timeline
				} else {
					var query = getHashStringParameter('query');
					thing.type		= "search";
					thing.query 	= query
				}
				T = Object.create(Timeline);
				T.init(thing);
				window.Timelines.push(T);
		    }
		}, 500);
	})();
});