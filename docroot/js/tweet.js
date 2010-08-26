"use strict";

/*global
	data: true,
	html_entity_decode: true,
	relative_time: true,
	YUI: true,
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
		in_reply_to_screen_name: null,
		in_reply_to_status_id: null,
		in_reply_to_user_id: null,
		in_reply_to_url: null,
		
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
				this.in_reply_to_screen_name = data.in_reply_to_screen_name;
				this.in_reply_to_status_id = data.in_reply_to_status_id;
				this.in_reply_to_user_id = data.in_reply_to_user_id;
				this.in_reply_to_url = "http://twitter.com/" + this.in_reply_to_screen_name + "/status/" + this.in_reply_to_status_id;
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
				
				if (data.in_reply_to_screen_name) {
					html.push(" in reply to <a href='" + data.in_reply_to_url + "' target='_blank'>" + data.in_reply_to_screen_name + "</a>");
				}
				
				html.push("   | <span class='pseudolink link-reply'>Reply</span>");
				html.push("   | <span class='pseudolink link-retweet'>Retweet</span>");
			//	html.push("   | <span class='pseudolink link-favorite'>Favorite</span>");
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