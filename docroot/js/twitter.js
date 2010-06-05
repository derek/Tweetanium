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
		
		call : function (request, callback, where, context) {
			var  oauth, responseHandler, whereText, yql;
			responseHandler = false;
			yql = false;
			oauth = false;
			
			if (request.type === "timeline") {
				
				switch (request.timeline) {
				
				case "dmin":
					oauth = true;
					yql = 'SELECT * FROM twitter.directmessages WHERE count=50 AND ' + where.field + ' = ' + where.value + ' AND #oauth#';
					break;

				case "dmout":
					oauth = true;	
					yql = 'SELECT * FROM twitter.directmessages.sent WHERE count=50 AND ' + where.field + ' = ' + where.value + ' AND #oauth#';
					break;
				
				case "favorites":
					oauth = true;
					yql = 'SELECT * FROM twitter.favorites WHERE id=' + user_id + ' AND #oauth#';
					break;

				case "home":
					oauth = true;
					yql = 'SELECT * FROM twitter.status.timeline.friends WHERE count=50 AND ' + where.field + ' = ' + where.value + ' AND #oauth#';
					break;
					
				case "mentions":
					oauth = true;
					//yql = 'use "http://github.com/zachgraves/yql-tables/raw/master/twitter/twitter.status.mentions.xml" as twitter.status.mentions;';
					yql = 'SELECT * FROM twitter.status.mentions WHERE count=50 AND ' + where.field + ' = ' + where.value + ' AND #oauth#';
					break;

				case "sent":
					oauth = true;
					yql = 'SELECT * FROM twitter.status.timeline.user WHERE count=50 AND ' + where.field + ' = ' + where.value + ' AND #oauth#';
					break;

				default:
					throw ("Invalid Twitter API method");
						
				}
								
				responseHandler = this.tweetHandler;
			}
			
			else if (request.type === "search") {
				if (where.value > 1) {
					whereText = where.field + ' = ' + where.value + ' AND';
				}
				else {
					whereText = '';
				}
				yql = "SELECT * FROM twitter.search WHERE " + whereText + " q='" + addslashes(request.query) + "'";
				responseHandler = this.tweetHandler;
			}
			
			else if (request.type === "list") {
				//yql = 'use "http://github.com/drgath/yql-tables/raw/master/twitter/twitter.lists.statuses.xml" as twitter.lists.statuses;';
				yql = 'SELECT * FROM twitter.lists.statuses WHERE user="' + screen_name + '" AND list_id="' + request.list + '" AND per_page=100 AND ' + where.field + ' = ' + where.value + ' AND #oauth#';
				responseHandler = this.tweetHandler;
			}
			
			else if (request.type === "lists") {
				yql = 'SELECT * FROM twitter.lists WHERE user="' + screen_name + '" AND #oauth#';
				responseHandler = this.listHander;
			}
			
			else if (request.type === "update") {
				yql = 'UPDATE twitter.status SET status = "' + addslashes(request.status) + '" WHERE #oauth#'
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
			
			else if (request.type === "request_token") {
				yql = 'select * from twitter.oauth.requesttoken where oauth_callback="http://tweetanium.net/index.html";';
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
				//yql = yql.replace("#oauth#", ' oauth_token = "' + getQueryStringParameter('oauth_token') + '" AND oauth_token_secret = "' + getQueryStringParameter('oauth_verifier') + '"');
				yql = yql.replace("#oauth#", ' oauth_token = "' + Y.StorageLite.getItem('oauth_token') + '" AND oauth_token_secret = "' + Y.StorageLite.getItem('oauth_token_secret') + '"');
				
				console.log("Executing: " + yql);
				new Y.yql(yql, function(r) {
					console.log(r);
					responseHandler(r.query, callback, context);
				}, {env: "store://tweetanium.net/tweetanium06"});
			}
			else {
				throw new Error("No YQL defined");
			}
		},
		
		// ******
		// Response Handlers
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
		console.log(results);
			callback(results.results.hash);
		},
		
		requestTokenHandler : function (results, callback) {
			// TODO: cleanup
			var r = results.results.result;
			var parts = r.split("&");
			var back = {};
			back.oauth_token = parts[0].split("=")[1];
			back.oauth_token_secret= parts[1].split("=")[1];
			
			callback(back);
		},
		
		tweetHandler : function (results, callback, context) {
			var i, rawTweets, Tweets, Tweet;
			
			Tweets = [];
			rawTweets = [];
			try {
				if (results.results.results) {
					rawTweets = results.results.results;
				}
				else if (results["direct-messages"]) {
					rawTweets = results["direct-messages"].direct_message;
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
		
	}; // End of Twitter

}, '0.0.1', { requires: ['io-base'] });