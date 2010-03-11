YUI.add('Twitter', function(Y) {

	Y.Twitter = {
		
		call : function(request, callback, where, context) {
			var yql = false;
			var responseHandler = false;
			var http_method = "GET";
			
			if (request.type == "timeline") {
				switch(request.timeline) {
					case "home":
						yql = 'SELECT * FROM twitter.status.timeline.friends 	WHERE count=50 AND ' + where.field + ' = ' + where.value + ' AND #oauth#;';
						break;

					case "sent":
						yql = 'SELECT * FROM twitter.status.timeline.user 		WHERE count=50 AND ' + where.field + ' = ' + where.value + ' AND #oauth#;';
						break;

					case "mentions":
						//yql = 'use "http://github.com/zachgraves/yql-tables/raw/master/twitter/twitter.status.mentions.xml" as twitter.status.mentions;';
						yql = 'SELECT * FROM twitter.status.mentions	 		WHERE count=50 AND ' + where.field + ' = ' + where.value + ' AND #oauth#;';
						break;

					case "dmout":	
						yql = 'SELECT * FROM twitter.directmessages.sent 		WHERE count=50 AND ' + where.field + ' = ' + where.value + ' AND #oauth#;';
						break;

					case "dmin":	
						yql = 'SELECT * FROM twitter.directmessages 			WHERE count=50 AND ' + where.field + ' = ' + where.value + ' AND #oauth#;';
						break;

					case "favorites":
						yql = 'SELECT * FROM twitter.favorites			 		WHERE id=' + _user_id + ' AND #oauth#;';
						break;

					default:
						throw("Invalid Twitter API method");
						break;
				}
				responseHandler = this.tweetHandler;
			}
			
			else if (request.type == "search") {
				if (where.value > 1) {
					whereText = where.field + ' = ' + where.value + ' AND';
				}
				else {
					whereText = '';
				}
				yql = "SELECT * FROM twitter.search WHERE " + whereText + " q='" + addslashes(request.query) + "'";
				responseHandler = this.tweetHandler;
			}
			
			else if (request.type == "list") {
				yql = 'use "http://github.com/drgath/yql-tables/raw/master/twitter/twitter.lists.statuses.xml" as twitter.lists.statuses;';
				yql += 'SELECT * FROM twitter.lists.statuses WHERE user="' + _screen_name + '" AND list_id="' + request.list + '" AND per_page=100 AND ' + where.field + ' = ' + where.value + ' AND #oauth#;';
				responseHandler = this.tweetHandler;
			}
			
			else if (request.type == "lists") {
				yql = 'SELECT * FROM twitter.lists WHERE user="' + _screen_name + '" AND #oauth#;';
				responseHandler = this.listHander;
			}
			
			else if (request.type == "update") {
				//status, in_reply_to_status_id, latitude, longitude
				yql = 'INSERT INTO twitter.status (status, oauth_consumer_key, oauth_consumer_secret, oauth_token, oauth_token_secret) VALUES ("' + request.status + '", "#oauth_consumer_key#", "#oauth_consumer_secret#", "#oauth_token#", "#oauth_token_secret#");';
				responseHandler = this.updateHandler;
				http_method = "POST";
			}
			
			else if (request.type == "trends") {
				yql = 'SELECT * FROM twitter.trends.current;';
				responseHandler = this.trendsHandler;
			}
			
			else if (request.type == "saved_searches") {
				yql = 'SELECT * FROM twitter.search.saved WHERE #oauth#;';
				responseHandler = this.savedSearchHandler;
			}
			
			else if (request.type == "rate_limit_status") {
				yql = 'SELECT * FROM twitter.account.ratelimit;';
				responseHandler = this.rateLimitHandler;
			}
			
			else {
				throw("Unknown request type");
			}
			
			if (yql) {
				YQL(yql, {
					method: http_method,
					on: {
						start: function(){ 
							console.log("YQL: " + yql);
						},
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
		
		// ******
		// Response Handlers
		// 
		
		listHander : function(results, callback) {
			callback(results.lists_list.lists.list);
		},
		
		updateHandler : function(results, callback) {
			callback(results.status);
		},
		
		savedSearchHandler : function(results, callback) {
			callback(results.saved_searches.saved_search);
		},
		
		trendsHandler : function(results, callback) {
			var timestamp = results.trends;
			for (var i in timestamp) {
				var trends = timestamp[i];
				callback(trends);
			}
		},
		
		rateLimitHandler : function(results, callback) {
			callback(results.hash);
		},
		
		tweetHandler : function(results, callback, context) {
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


	// *******
	// Helpers
	// 
	
	function YQL(yql, params){
		params.method 	= params.method;
		params.data 	= "yql=" + escape(yql);
		Y.io("yql.php", params);
	}

}, '0.0.1', { requires: ['io-base'] });