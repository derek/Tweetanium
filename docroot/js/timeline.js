"use strict";

/*global
	getTimeline: true,
	Timelines: true,
	window: true,
	YUI: true,
*/

YUI.add('Timeline', function (Y) {
	
	Y.Timeline = {
		
		// Properties
		timer: null,
		active: true,
		updating: false,
		interval: 62000,
		
		// Methods
		init: function (config) {
			if (!config) { 
				throw new Error("Missing config param"); 
			}
			
			this.timelineId = new Date().getTime();
			this.config = config;

			//console.log("Timeline {" + this.config.timeline + " - " + this.timelineId + "} created");

			Y.one("#timeline .inner").get('children').remove(true);

			setTimeout(this.update, 0, this); // TODO: figure out why this works the way it does and the normal way doesn't

			this.beginTimer();

			return this;
		},

		beginTimer: function () {
			this.timer = setInterval(this.update, this.interval, this);
		},

		update: function (that) {
			//console.log("Timeline {" + that.config.timeline + " - " + that.timelineId + "} updating...");
			that.addBucket("prepend").getTweets(that.config, {
				field : "since_id",
				value : getTimeline(that.timelineId).highestTweetId()
			});
		},

		addBucket: function (where) {
			if (this.active === false) {
				throw new Error("Sorry, timeline {" + this.alias + "} is dead");
			}
			else {
				var Bucket;
				
				Bucket = Object.create(Y.Bucket);
				Bucket.init(this);

				//console.log(where + "ing bucketId {" + Bucket.bucketId + "} to timeline {" + this.config.timeline + "}");

				switch (where) {
					
				case "append":
					Y.one("#timeline .inner").append(Bucket.asHtml());
					break;

				case "prepend":
					Y.one("#timeline .inner").prepend(Bucket.asHtml());
					break;

				default :
					throw new Error("Whatchoo talkin' bout Willis?");
					
				}

				return Bucket;
			}
		},

		lowestTweetId: function () {
			var tweet_id;
			
			tweet_id = 9999999999999999;

			Y.all(".tweet").each(function (tweet) {
				var id = tweet.get('id').replace("tweetid-", "");
				
				if (parseInt(id, 10) < tweet_id) {
					tweet_id = id;
				}
			});

			return tweet_id;
		},
		
		highestTweetId: function () {
			var tweet_id;
			
			tweet_id = 1;

			Y.all(".tweet").each(function (tweet) {
				var id;
				
				id = tweet.get('id').replace("tweetid-", "");
				
				if (parseInt(id, 10) > tweet_id) {
					tweet_id = id;
				}
			});

			return tweet_id;
		},
		
		destroy: function () {
		//	console.log("Timeline {" + this.config.timeline + " - " + this.timelineId + "} destroyed");
			clearInterval(this.timer);
			this.active = false;
		}
		
	}; // End of Timeline
	
	
	// *******
	// Helpers
	// 

	function getTimeline(timelineId) {
		var len, i;
		
		len = window.Timelines.length;
		
		for (i = 0; i < len; i = i + 1) {
			if (window.Timelines[i].timelineId === timelineId) {
				return window.Timelines[i];
			}
		}	
	}
	
}, '0.0.1', { requires: ['node'] });
