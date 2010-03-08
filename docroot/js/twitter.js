YUI.add('Twitter', function(Y) {

	Y.Twitter = {
		
		call : function(request, callback, where, context) {
			var Tweets 	= [];
			var yql 	= false;
			var responseHandler = false;
			
			if (request.type == "timeline") {
				switch(request.timeline) {
					case "home":
						yql = 'SELECT * FROM twitter.status.timeline.friends 	WHERE ' + where.field + ' = ' + where.value + ' AND #oauth#;';
						break;

					case "sent":
						yql = 'SELECT * FROM twitter.status.timeline.user 		WHERE ' + where.field + ' = ' + where.value + ' AND #oauth#;';
						break;

					case "mentions":
						//yql = 'use "http://github.com/zachgraves/yql-tables/raw/master/twitter/twitter.status.mentions.xml" as twitter.status.mentions;';
						yql = 'SELECT * FROM twitter.status.mentions	 		WHERE ' + where.field + ' = ' + where.value + ' AND #oauth#;';
						break;

					case "favorites":
						yql = 'SELECT * FROM twitter.favorites			 		WHERE id=' + _user_id + ' AND #oauth#;';
						break;

					case "dmin":	
						yql = 'SELECT * FROM twitter.directmessages 			WHERE ' + where.field + ' = ' + where.value + ' AND #oauth#;';
						break;

					case "dmout":	
						yql = 'SELECT * FROM twitter.directmessages.sent 		WHERE ' + where.field + ' = ' + where.value + ' AND #oauth#;';
						break;

					default:
						throw("Invalid Twitter API method");
						break;
				}
				responseHandler = this.tweetHander;
			}
			
			else if (request.type == "search") {
				yql = 'SELECT * FROM twitter.search WHERE ' + where.field + ' = ' + where.value + ' AND q="' + (request.timeline) + '";';
				responseHandler = this.tweetHander;
			}
			
			else if (request.type == "lists") {
				yql = 'SELECT * FROM twitter.lists WHERE user="' + _screen_name + '" AND #oauth#;';
				responseHandler = this.listHander;
			}
			
			else if (request.type == "list") {
				yql = 'use "http://github.com/drgath/yql-tables/raw/master/twitter/twitter.lists.statuses.xml" as twitter.lists.statuses;';
				yql += 'SELECT * FROM twitter.lists.statuses WHERE user="' + _screen_name + '" AND list_id="' + request.timeline + '" AND ' + where.field + ' = ' + where.value + ' AND #oauth#;';
				responseHandler = this.tweetHander;
			}
			
			else {
				throw("Unknown request type");
			}
			
			if (yql) {
				YQL(yql, {
					on: {
						start: function(){ /* nothing */ },
						complete: function(id, response, args){
							var response = Y.JSON.parse(response.responseText);
						
							if (response.error) {
								errorHandler(response.error);
							} 
							else {
								responseHandler(response.results, callback, context);
							}
								
							return true;
						},
						end: function(){ /* nothing */ },
					}
				});
			}
			else {
				throw("No YQL defined");
			}
		},
		
		listHander : function(results, callback) {
			callback(results.lists_list.lists.list);
		},
		
		tweetHander : function(results, callback, context) {
			var Tweets 		= [];
			var rawTweets	= [];
			
			try {
				if (results.results) {
					rawTweets = results.results;
				}
				else if (results["direct-messages"]) {
					rawTweets = results["direct-messages"]["direct_message"];
				}
				else {
					rawTweets = results.statuses.status;
				}	
			
				if (!rawTweets.reverse) { // Test to see if it is an array
					rawTweets = [rawTweets]; // No? Make it one.
				}

				for (var i in rawTweets) { 
					Tweet = Object.create(Y.Tweet);
					Tweet.init(rawTweets[i]);
					Tweets.push(Tweet);
				}
			} catch(error) {
	
			}
				
			callback(Tweets, context);
		}
		
	}; // End of Twitter

	// Helpers
	function YQL(yql, params){
		params.method 	= "GET";
		params.data 	= "yql=" + escape(yql);
		Y.io("yql.php", params);
	}

}, '0.0.1', { requires: ['io-base'] });