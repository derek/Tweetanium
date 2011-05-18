/*global
	addslashes: true,
	errorHandler: true,
	escape: true,
	screen_name: true,
	user_id: true,
	YQL: true,
	YUI: true,
*/

YUI.add('Twitter', function (Y) {
    "use strict";
	
	Y.Twitter = function() {
		
		var config = {};
		
		return {
			
			config : function(params) {
				for(var k in params) {
					config[k] = params[k];
				}
			},
			
			call : function (request, callback, params, context) {
			    
				// Define some vars
				var  responseHandler, whereText, yql;

				// Set params to an object if it is falsy
				params = params || {};

				// Some more default values
				responseHandler = false;
				yql = false;
				
				// If the requested API call is a timeline
				if (request.type === "timeline") {

					// Limit the query to 50 tweets
					whereText = " WHERE count=50 ";
					
					// Specify the max or min tweet id
					if (params.since_id) {
						whereText = whereText + " AND since_id=" + params.since_id + " ";
					}
					else if (params.max_id) {
						whereText = whereText + " AND max_id=" + params.max_id + " ";
					}

					// Add in OAuth placeholder (that will be string replaced later)
					whereText = whereText + " AND #oauth#";

					// Switch through to find the specific YQL query we are needing
					switch (request.timeline) {

					case "dmin":
						yql = 'SELECT * FROM twitter.directmessages ' + whereText;
						break;

					case "dmout":	
						yql = 'SELECT * FROM twitter.directmessages.sent ' + whereText;
						break;

					case "favorites":
						yql = 'SELECT * FROM twitter.favorites WHERE id="' + config.screen_name + '" AND #oauth#';
						break;

					case "home":
						yql = 'SELECT * FROM twitter.status.timeline.friends ' + whereText;
						break;

					case "mentions":
						yql = 'SELECT * FROM twitter.status.mentions ' + whereText;
						break;

					case "sent":
						yql = 'SELECT * FROM twitter.status.timeline.user ' + whereText;
						break;

					default:
						throw ("Invalid Twitter API method");

					}

					responseHandler = this.tweetHandler;
				}

				else if (request.type === "search") {
					whereText = 'WHERE q="' + addslashes(request.query) + '"';
					
					// Specify the max or min tweet id
					if (params.since_id) {
						whereText = whereText + " AND since_id=" + params.since_id + " ";
					}
					else if (params.max_id) {
						whereText = whereText + " AND max_id=" + params.max_id + " ";
					}
					
					yql = "SELECT * FROM twitter.search " + whereText + "";
					responseHandler = this.tweetHandler;
				}

				else if (request.type === "list") {
					whereText = 'WHERE user="' + request.list.split("/")[1] + '" AND list_id="' + request.list.split("/")[2] + '" AND per_page=100 ';
					
					// Specify the max or min tweet id
					if (params.since_id) {
						whereText = whereText + " AND since_id=" + params.since_id + " ";
					}
					else if (params.max_id) {
						whereText = whereText + " AND max_id=" + params.max_id + " ";
					}
					
					yql = 'SELECT * FROM twitter.lists.statuses ' + whereText + ' AND #oauth#';
					responseHandler = this.tweetHandler;
				}

				else if (request.type === "lists") {
					yql = 'SELECT * FROM twitter.lists WHERE user="' + config.screen_name + '" AND #oauth#';
					responseHandler = this.listHander;
				}

				else if (request.type === "list_subscriptions") {
					//alert('a');
					yql = 'SELECT * FROM twitter.lists.subscriptions WHERE user="' + config.screen_name + '" AND #oauth#';
					responseHandler = this.listHander;
				}

				else if (request.type === "update") {
					yql = 'UPDATE twitter.status SET status = "' + addslashes(request.status) + '" WHERE #oauth#';
					responseHandler = this.updateHandler;
				}

				else if (request.type === "trends") {
					yql = 'SELECT * FROM twitter.trends.current';
					responseHandler = this.trendsHandler;
				}

				else if (request.type === "saved_searches") {
					yql = 'SELECT * FROM twitter.search.saved WHERE #oauth#';
					responseHandler = this.savedSearchHandler;
				}

				else if (request.type === "rate_limit_status") {
					yql = 'SELECT * FROM twitter.account.ratelimit WHERE #oauth#';
					responseHandler = this.rateLimitHandler;
				}

				else if (request.type === "profile") {
					yql = 'select * from twitter.users where id="' + params.username + '"';
					responseHandler = this.profileHandler;
				}
				
				else if (request.type === "favorite_create") {
					
					// Can't really do favorites at this point because INSERTS cannot access environment variables.  Need to create a custom table.
					//yql = 'UPDATE twitter.favorites SET status = "' + addslashes(request.status) + '" WHERE #oauth#';
					//yql = 'INSERT INTO twitter.favorites WHERE id="' + request.tweet_id + '" AND #oauth#';
					//responseHandler = this.favoriteHandler;
				}

				else if (request.type === "credentials") {
					yql = 'select * from twitter.account.credentials WHERE #oauth#';
					responseHandler = this.profileHandler;
				}

				else if (request.type === "request_token") {
					yql = 'select * from twitter.oauth.requesttoken where oauth_callback="http://' + window.location.host + window.location.pathname + '";';
					responseHandler = this.requestTokenHandler;
				}

				else if (request.type === "access_token") {
					yql = 'select * from twitter.oauth.accesstoken where oauth_verifier="' + Y.StorageLite.getItem('oauth_verifier') + '" and #oauth#;';
					responseHandler = this.requestTokenHandler;
				}

				else {
					throw ("Unknown request type");
				}

				if (yql) {
					//Y.log(config);
					yql = yql.replace("#oauth#", ' oauth_token = "' + config.oauth_token + '" AND oauth_token_secret = "' + config.oauth_token_secret + '"');
					params.env = "store://tweetanium.net/tweetanium06";
					//Y.log("Executing: " + yql);
					new Y.YQL(yql, function (r) {
						//Y.log("Reponse:");
						//Y.log(r);
						responseHandler(r.query, callback, context);
					}, params, {proto: "https"});
				}
				else {
					throw new Error("No YQL defined");
				}
			},



			// ******
			// Response Handlers
			// - These take a YQL response, and do whatever parsing neccesary to return an object with all the relevant data
			// 

			listHander : function (results, callback) {
				callback(results.results.lists_list.lists.list);
			},

			updateHandler : function (results, callback) {
				callback(results.results.status);
			},

			favoriteHandler : function (results, callback) {
				//Y.log(results);
				callback(results.results.status);
			},

			savedSearchHandler : function (results, callback) {
				callback(results.results.saved_searches.saved_search);
			},

			trendsHandler : function (results, callback) {
				var i, timestamp, trends;
				return false;
				timestamp = results.results.trends;

				for (i in timestamp) {
					if (timestamp.hasOwnProperty(i)) {
						trends = timestamp[i];
						callback(trends);
					}
				}
			},

			rateLimitHandler : function (results, callback) {
				callback(results.results.hash);
			},

			profileHandler : function (results, callback) {
				callback(results.results.user);
			},

			requestTokenHandler : function (results, callback) {
				var parts, response, tokens;
				response = results.results.result;
				parts = response.split("&");

				tokens = {};
				tokens.oauth_token = parts[0].split("=")[1];
				tokens.oauth_token_secret = parts[1].split("=")[1];

				callback(tokens);
			},

			tweetHandler : function (results, callback, context) {
				var i, rawTweets, Tweets, Tweet;

				Tweets = [];
				rawTweets = [];

				try {
					if (results.results.results) {
						rawTweets = results.results.results;
					}
					else if (results.results["direct-messages"]) {
						rawTweets = results.results["direct-messages"].direct_message;
					}
					else {
						rawTweets = results.results.statuses.status;
					}	

					if (!rawTweets.reverse) { // Test to see if it is an array
						rawTweets = [rawTweets]; // No? Make it one.
					}
					for (i in rawTweets) {
						if (rawTweets.hasOwnProperty(i)) {
							Tweet = Object.create(Y.Tweet);
						//Y.log(rawTweets[i]);
							Tweet.init(rawTweets[i]);
							Tweets.push(Tweet);
						}
					}
				} catch (error) {
					/* nothing */
				}

				callback(Tweets, context);

			} // End of Response Handlers
		}; // End of closure
	}(); // End of Twitter

}, '0.0.1', { requires: ['io-base', 'myYQL'] });