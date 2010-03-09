YUI.add('Tweet', function(Y) {
	
	Y.Tweet = {
		
		// Properties
		id: null,
		text: null,
		userName: null,
		createdAt: null,
		createdAgo: null,
		profileImage: null,
		
		// Methods
		init: function(data){

			if (data.sender) { // Is a DM
				this.id 			= data.id;
				this.text			= data.text;
				this.profileImage 	= data.sender.profile_image_url;
				this.userName 		= data.sender.screen_name;
				
				values = data.created_at.split(" ");
				this.createdAt  = Date.parse( values[1] + " " + values[2] + ", " + values[5] + " " + values[3]);
				this.createdAgo = relative_time(this.createdAt);
			}
			
			else if (data.user) { // Is a regular tweet
				this.id 			= data.id;
				this.text			= data.text;
				this.userName 		= data.user.screen_name;
				this.profileImage 	= data.user.profile_image_url;

				values = data.created_at.split(" ");
				this.createdAt  = Date.parse( values[1] + " " + values[2] + ", " + values[5] + " " + values[3]);
				this.createdAgo = relative_time(this.createdAt);
			}

			else { // Comes from search
				this.id 			= data.id;
				this.text			= data.text;
				this.userName 		= data.from_user;
				this.profileImage 	= data.profile_image_url;

				values = data.created_at.split(" ");
				this.createdAt  = Date.parse(values[2] + " " + values[1] + ", " + values[3] + " " + values[4]);
				this.createdAgo = relative_time(this.createdAt);
			}
			
			// pre-load the image
			new Image(100,25).src=this.profileImage; 
			
		},
		
		asHtml: function() {
			data = this;
			return function(){
				var html = [];

				data.text = data.text.replace(/((ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?)/gi,'<a href="$1" target="_blank">$1<\/a>');
				data.text = data.text.replace(/@([a-zA-Z0-9_]+)/gi,'<span class="pseudolink username">@$1<\/span>');
				data.text = data.text.replace(/#([a-zA-Z0-9_]+)/gi,'<a class="query" href="#query=%23$1">#$1<\/a>');

				html.push("<div class='tweet' id='tweetid-{id}'>");
				html.push("		<div>");
				html.push("			<a class='tweet-image' href=''><img src='{profileImage}' height='50' width='50'></a>");
				html.push("		</div>");
				html.push("		<div class='tweet-body'>");
				html.push("			<span class='pseudolink username'>{userName}</span>: {text}");
				html.push("		<div class='tweet-footer'><a href='http://twitter.com/{userName}/status/{id}' target='_blank'>{id}</a> - <span class='timestamp' title='{createdAt}'>{createdAgo}</span></div>");
				html.push("		</div>");
				html.push("		<div style='clear:both'></div>");
				html.push("</div>");

				html = html.join('').supplant(data);

				return html;
			}();
		}
		
	}; // End of Tweet
	
}, '0.0.1', { requires: ['node'] });