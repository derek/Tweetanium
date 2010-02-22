YUI.add('Bucket', function(Y) {

	Y.Bucket = {
		
		// Properties
		bucketId: 0,
	
		// Methods
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
			Y.Twitter.call(request, function(Tweets, Bucket){
				Bucket.addTweets(Tweets);
			}, where, this);
		},
		
		addTweets: function(Tweets) {
			var html = [];

			for(var i in Tweets) {
				html.push(Tweets[i].asHtml());
			}

			html = html.join('');
			
			Y.one("#bucketId-" + this.bucketId + ' .inner').set("innerHTML", html);
		},
		
	} // End of Bucket

}, '0.0.1', { requires: ['node'] });