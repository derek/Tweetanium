"use strict";

/*global
	YUI: true,
	data: true,
	relative_time: true,
	html_entity_decode: true,
*/

YUI.add('Tweet', function (Y) {
	
	Y.Tweet = {
		
		// Properties
		id: null,
		text: null,
		userName: null,
		createdAt: null,
		createdAgo: null,
		profileImage: null,
		
		// Methods
		init: function (data) {
			
			var time_split;

			if (data.sender) { // Is a DM
				time_split = data.created_at.split(" ");
				
				this.createdAt = Date.parse(time_split[1] + " " + time_split[2] + ", " + time_split[5] + " " + time_split[3]);
				this.createdAgo = relative_time(this.createdAt);
				this.id = data.id;
				this.profileImage = data.sender.profile_image_url;
				this.source = data.source;
				this.text = data.text;
				this.userName = data.sender.screen_name;
			}
			
			else if (data.user) { // Is a regular tweet
				time_split = data.created_at.split(" ");
				
				this.createdAt  = Date.parse(time_split[1] + " " + time_split[2] + ", " + time_split[5] + " " + time_split[3]);
				this.createdAgo = relative_time(this.createdAt);
				this.id = data.id;
				this.profileImage = data.user.profile_image_url;
				this.source = data.source;
				this.text = data.text;
				this.userName = data.user.screen_name;
			}

			else { // Comes from search
				time_split = data.created_at.split(" ");
				
				this.createdAt = Date.parse(time_split[2] + " " + time_split[1] + ", " + time_split[3] + " " + time_split[4]);
				this.createdAgo = relative_time(this.createdAt);
				this.id = data.id;
				this.profileImage = data.profile_image_url;
				this.source = html_entity_decode(data.source);
				this.text = data.text;
				this.userName = data.from_user;
			}
			
			// pre-load the image
			new Image(100, 25).src = this.profileImage; 
			
		},
		
		asHtml: function () {
			var data;
			
			data = this;
			
			return (function () {
				var html = [];
				
				data.prettyText = data.text;
				data.prettyText = data.prettyText.replace(/((ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?)/gi, '<a href="$1" target="_blank">$1<\/a>');
				data.prettyText = data.prettyText.replace(/@([a-zA-Z0-9_]+)/gi, '<span class="pseudolink username">@$1<\/span>');
				data.prettyText = data.prettyText.replace(/#([a-zA-Z0-9_]+)/gi, '<a class="query" href="#query=%23$1">#$1<\/a>');

				html.push("<div class='tweet' id='tweetid-{id}'>");
				html.push(" <div>");
				html.push("  <a class='tweet-image' href=''><img src='{profileImage}' height='50' width='50'></a>");
				html.push(" </div>");
				html.push(" <div class='tweet-body'>");
				html.push("  <span class='hidden raw-text'>{text}</span>");
				html.push("  <span class='pseudolink username'>{userName}</span>: {prettyText}");
				html.push("  <div class='tweet-footer'>");
				html.push("   <a href='http://twitter.com/{userName}/status/{id}' target='_blank' title='{createdAt}' class='timestamp'>{createdAgo}</a>");
				html.push("   via {source}");
				html.push("   | <span class='pseudolink link-reply'>Reply</span>");
				html.push("   | <span class='pseudolink link-retweet'>Retweet</span>");
				html.push("  </div>");
				html.push("  <div class='tweet-extra'></div>");
				html.push(" </div>");
				html.push("</div>");
				html.push("<div style='clear:both'></div>");

				html = html.join('').supplant(data);

				return html;
			}());
		}
		
	}; // End of Tweet
	
}, '0.0.1', { requires: ['node'] });