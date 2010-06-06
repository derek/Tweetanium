"use strict";

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
	
	Y.Twitter = {
		
		call : function (request, callback, params, context) {
			var  responseHandler, whereText, yql;
			params = params || {};
			responseHandler = false;
			yql = false;
			
			if (request.type === "timeline") {
				
				switch (request.timeline) {
				
				case "dmin":
					yql = 'SELECT * FROM twitter.directmessages WHERE count=50 AND #oauth#';
					break;

				case "dmout":	
					yql = 'SELECT * FROM twitter.directmessages.sent WHERE count=50 AND #oauth#';
					break;
				
				case "favorites":
					yql = 'SELECT * FROM twitter.favorites WHERE id="' + Y.StorageLite.getItem('screen_name') + '" AND #oauth#';
					break;

				case "home":
					yql = 'SELECT * FROM twitter.status.timeline.friends WHERE count=50 AND #oauth#';
					break;
					
				case "mentions":
					yql = 'SELECT * FROM twitter.status.mentions WHERE count=50 AND #oauth#';
					break;

				case "sent":
					yql = 'SELECT * FROM twitter.status.timeline.user WHERE count=50 AND #oauth#';
					break;

				default:
					throw ("Invalid Twitter API method");
						
				}
								
				responseHandler = this.tweetHandler;
			}
			
			else if (request.type === "search") {
				if (params.value > 1) {
					whereText = params.field + ' = ' + params.value + ' AND';
				}
				else {
					whereText = '';
				}
				yql = "SELECT * FROM twitter.search WHERE " + whereText + " q='" + addslashes(request.query) + "'";
				responseHandler = this.tweetHandler;
			}
			
			else if (request.type === "list") {
				yql = 'SELECT * FROM twitter.lists.statuses WHERE user="' + screen_name + '" AND list_id="' + request.list + '" AND per_page=100 AND since_id = ' + params.since_id + ' AND #oauth#';
				responseHandler = this.tweetHandler;
			}
			
			else if (request.type === "lists") {
				yql = 'SELECT * FROM twitter.lists WHERE user="' + screen_name + '" AND #oauth#';
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
				yql = yql.replace("#oauth#", ' oauth_token = "' + Y.StorageLite.getItem('oauth_token') + '" AND oauth_token_secret = "' + Y.StorageLite.getItem('oauth_token_secret') + '"');
				params.env = "store://tweetanium.net/tweetanium06";
				//console.log("Executing: " + yql);
				new Y.yql(yql, function (r) {
					//console.log(r);
					responseHandler(r.query, callback, context);
				}, params);
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
		
		savedSearchHandler : function (results, callback) {
			callback(results.results.saved_searches.saved_search);
		},
		
		trendsHandler : function (results, callback) {
			var i, timestamp, trends;
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
					//console.log(rawTweets[i]);
						Tweet.init(rawTweets[i]);
						Tweets.push(Tweet);
					}
				}
			} catch (error) {
				/* nothing */
			}
				
			callback(Tweets, context);
		}
		// End of Response Handlers
		
	}; // End of Twitter

}, '0.0.1', { requires: ['io-base'] });