YUI.add('Twitter', function(Y) {

	Y.Twitter = {
		call : function(request, callback, where, context) {
			
			var Tweets 	= [];
			var yql 	= false;
			
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
						throw("Invalid Twitter API method");
						break;
				}
				
			} else {
				yql = 'SELECT * FROM twitter.search WHERE ' + where.field + ' = ' + where.value + ' AND q="' + (request.query) + '";';
			}
			
			if (yql) {
				YQL(yql, {
					on: {
						start: function(){ /* nothing */ },
						complete: function(id, response, args){
							var rawTweets = []
							var response = Y.JSON.parse(response.responseText);
							
							if (response.error) {
								errorHandler(response.error);
							} else {
								if(response.results)
								{
									if (response.results.results) {
										rawTweets = response.results.results;
									}
									else if (response.results["direct-messages"]) {
										rawTweets = response.results["direct-messages"]["direct_message"];
									}
									else {
										rawTweets = response.results.statuses.status;
									}	
									
									if (!rawTweets.reverse) { // Test to see if it is an array
										rawTweets = [rawTweets]; // No? Make it one.
									}
							
									for (var i in rawTweets) { 
										Tweet = Object.create(Y.Tweet);
										Tweet.init(rawTweets[i]);
										Tweets.push(Tweet);
									}
							
									callback(Tweets, context);
								}
							}
						},
						end: function(){ /* nothing */ },
					}
				});
			}
			else {
				throw("No YQL defined");
			}
		}
	}; // End of Twitter

	// Helpers
	function YQL(yql, params){
		params.method 	= "GET";
		params.data 	= "yql=" + escape(yql);
		Y.io("yql.php", params);
	}

}, '0.0.1', { requires: ['io-base'] });