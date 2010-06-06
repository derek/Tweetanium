"use strict";

/*globals
	YUI: true,
*/

YUI.add('Bucket', function (Y) {

	Y.Bucket = {
		
		// Properties
		bucketId: 0,
	
		// Methods
		init: function () {
			this.bucketId = new Date().getTime();
			//console.log("Bucket {" + this.bucketId + "} created");
			return this;
		},
		
		asHtml: function () {
			var html = [];

			html.push("<div class='bucket' id='bucketId-{bucketId}'>");
			html.push("	<div class='inner'>");
			html.push("  <div align='center'><img src='/images/ajaxsm.gif'></div>");
			html.push("	</div>");
			html.push("</div>");

			return html.join('').supplant({
				bucketId: this.bucketId
			});
		},
		
		getTweets: function (request, params) {
			Y.Twitter.call(request, function (Tweets, Bucket) {
				Bucket.addTweets(Tweets);
			}, params, this);
		},
		
		addTweets: function (Tweets) {
			var html, i; 
			
			html = [];
			
			if (Tweets.length > 0) {
				for (i in Tweets) {
					if (Tweets.hasOwnProperty(i)) {
						html.push(Tweets[i].asHtml());
					}
				}
			}
			else if (Y.all(".bucket").size() === 1) {
				html.push("<div align='center'>No tweets found</div>");
			}

			html = html.join('');
			
			Y.one("#bucketId-" + this.bucketId + ' .inner').set("innerHTML", html);
		}
		
	}; // End of Bucket

}, '0.0.1', { requires: ['node'] });