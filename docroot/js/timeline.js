YUI.add('Timeline', function(Y) {

	Y.Timeline = {
		
		// Properties
		timer: null,
		active: true,
		updating: false,
		interval: 62000,
		
		// Methods
		init: function(config) {
			if (!config) { throw new ("Missing config param"); }
			
			this.timelineId = new Date().getTime();
			this.config 	= config;

			console.log("Timeline {" + this.config.timeline + " - " + this.timelineId + "} created");

			Y.one("#timeline").get('children').remove(true);

			Y.one("#timeline").append("<div class='inner'></div>");

			/*N = Y.Node.create("<div id='load-more-bucket-" + this.timelineId + "' align='center' class='dd pseudolink'>Load More</div>");

			N.on("click", function(e){
				timelineId = e.target.get("id").replace("load-more-bucket-", "");
				var that = getTimeline(timelineId);
				where = {
					field : "max_id",
					value : that.lowestTweetId(),
				};
				getTimeline(timelineId).addBucket("append").getTweets(that.config, where);
			});

			Y.one("#timeline").append(N);
*/		
			setTimeout(this.update, 0, this); // TODO: figure out why this works the way it does and the normal way doesn't
			//this.update(this);
			
			this.beginTimer();

			return this;
		},

		beginTimer: function() {
			this.timer = setInterval(this.update, this.interval, this);
		},

		update: function(that) {
			console.log("Timeline {" + that.config.timeline + " - " + that.timelineId + "} updating...");
			var where = {
				field : "since_id",
				value : getTimeline(that.timelineId).highestTweetId(),
			};
			that.addBucket("prepend").getTweets(that.config, where);
		},

		addBucket: function(where) {
			if (this.active === false)
			{
				throw("Sorry, timeline {" + this.alias + "} is dead");
				return false;
			}

			var Bucket = Object.create(Y.Bucket);
			Bucket.init(this);
			
			console.log(where + "ing bucketId {" + Bucket.bucketId + "} to timeline {" + this.config.timeline + "}");

			switch(where) {
				case "append" : 
					Y.one("#timeline .inner").append(Bucket.asHtml());
					break;

				case "prepend" :	
					Y.one("#timeline .inner").prepend(Bucket.asHtml());
					break;

				default : 
					throw("Whatchoo talkin' bout Willis?");
					break;
			}

			return Bucket;
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
		
		destroy: function() {
			console.log("Timeline {" + this.config.timeline + " - " + this.timelineId + "} destroyed");
			clearInterval(this.timer);
			this.active = false;
		},
		
	}; // End of Timeline
	
	
	// Helpers
	
	function getTimeline(timelineId){
		var l = Timelines.length;
		for(var i=0; i < l; i++) {
			if (Timelines[i].timelineId == timelineId) {
				return Timelines[i];
			}
		}	
	}
	
}, '0.0.1', { requires: ['node'] });
