/*globals
	YUI: true,
*/

YUI.add('Bucket', function (Y) {

    "use strict";

	Y.Bucket = {
		
		// Properties
		bucketId: 0,
		autoshow: false,
	
		// Methods
		init: function () {
			this.bucketId = new Date().getTime();
			//Y.log("Bucket {" + this.bucketId + "} created");
			return this;
		},
		
		asHtml: function (autoshow) {
			var autoshow = autoshow || false,
			    html = [],
			    hidden = false,
			    viewport = Y.one("#timeline").get('viewportRegion');
			    
      // If the user is viewing down the page a bit, then hide this bucket for later viewing.
      if (viewport.top > 150 && autoshow === false) {
        hidden = "hidden";
      }
      
			html.push("<div class='bucket' id='bucketId-{bucketId}'>");
			
			html.push("<div><span class='pseudolink link-show-bucket'>");
			if (hidden) {
			  html.push("<span class='new-tweet-count'></span> new tweets</span>");
			}
  	  html.push("</span></div>");
			
			html.push("	<div class='inner {hidden}'>");
			html.push("   <div align='center'><img src='images/ajaxsm.gif'></div>");
			html.push("	</div>");
			
			html.push("</div>");

			return html.join('').supplant({
				bucketId: this.bucketId,
				hidden: hidden
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
			else{
			  Y.one("#bucketId-" + this.bucketId + ' .link-show-bucket').remove();
		    if (Y.all(".bucket").size() === 1) {
			    html.push("<div align='center'>No tweets</div>");
		    }
			}

			html = html.join('');

			if (Y.one("#bucketId-" + this.bucketId + ' .new-tweet-count')) {
  			Y.one("#bucketId-" + this.bucketId + ' .new-tweet-count').set("innerHTML", Tweets.length); 
			}

			Y.one("#bucketId-" + this.bucketId + ' .inner').set("innerHTML", html);
		}
		
	}; // End of Bucket

}, '0.0.1', { requires: ['node', 'dom'] });