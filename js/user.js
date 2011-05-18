/*global
	errorHandler: true,
	YUI: true,
*/

YUI.add('User', function (Y) {

    "use strict";

	Y.User = {
		
		// Properties
		username: null,

		// Methods
		init: function (info) {
			this.username = info.username;
			return this;
		},
		
		load: function (callback) {
			var User;
			
			User = this;
			
			Y.Twitter.call({type: "profile"}, function(user){
				User.data = user;
				callback(User);
			}, {username:User.username});
		},
		
		asHtml: function () {
			var data;
			
			data = this.data;
			data.status = data.status.text; // Because the template doesn't support sub-properties
			
			return (function () {
				var html = [];

				html.push("<div><img src='http://img.tweetimag.es/i/{screen_name}_o' alt='{screen_name}' width='185' /></div>");
				html.push("<p><span class='bold'>Username</span> <span id='username'>{screen_name}</span></p>");
				html.push("<p><span class='bold'>Name</span> {name}</p>");
				html.push("<p><span class='bold'>Location</span> {location}</p>");
				html.push("<p><span class='bold'>Web</span> <a href='{url}' target='_blank'>{url}</a></p>");
				html.push("<p><span class='bold'>Bio</span> {description}</p>");
				html.push("<p><span class='bold'>Followers</span> {followers_count}</p>");
				html.push("<p><span class='bold'>Following</span> {friends_count}</p>");
				html.push("<p><span class='bold'>Updates</span> {statuses_count}</p>");
				html.push("<p>&nbsp;</p>");
				html.push("<p>{status}</p>");
				html.push("<p>&nbsp;</p>");
				html.push("<p><a href='#query=from:{screen_name}'>View {screen_name}'s Tweets</a></p>");
				html.push("<p><a href='#query=to:{screen_name}'>View {screen_name}'s Mentions</a></p>");
				html.push("<p><a href='http://twitter.com/{screen_name}' target='_blank'>View {screen_name}'s Twitter Page</a></p>");
				//html.push("<div id='friendship-detail'><span class='link-friendship pseudolink'>See Friendship Info</span></div>");

				html = html.join('').supplant(data);

				return html;
			}());
		}
		
	}; // End of Bucket

}, '0.0.1', { requires: ['node'] });