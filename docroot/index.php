<?

require_once('../config.php');

if (isset($_GET['login']))
{
	/* Create TwitterOAuth object and get request token */
	$connection = new TwitterOAuth(TWITTER_OAUTH_CONSUMER_KEY, TWITTER_OAUTH_CONSUMER_SECRET);

	/* Get request token */
	$request_token = $connection->getRequestToken(TWITTER_OAUTH_CALLBACK);

	/* Save request token to session */
	$_SESSION['oauth_token'] = $token = $request_token['oauth_token'];
	$_SESSION['oauth_token_secret'] = $request_token['oauth_token_secret'];

	/* If last connection fails don't display authorization link */
	switch ($connection->http_code)
	{
	case 200:
		/* Build authorize URL */
		$url = $connection->getAuthorizeURL($token);
		header('Location: ' . $url); 
	break;
	default:
		echo 'Could not connect to Twitter. Refresh the page or try again later.';
		die();
	break;
	}
}
else if (isset($_GET['logout']))
{
	session_destroy();
	session_regenerate_id();
	header("Location: http://" . $_SERVER['HTTP_HOST']);
}
//print_r($_SESSION);die();
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
"http://www.w3.org/TR/html4/strict.dtd">
<html>
	<head>
		<title>Tweetanium</title>
		<script type="text/javascript" src="http://yui.yahooapis.com/3.0.0/build/yui/yui-min.js"></script>
		<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.1/jquery.js"></script>
		<link rel="stylesheet" href="http://yui.yahooapis.com/2.7.0/build/reset-fonts-grids/reset-fonts-grids.css" type="text/css">
		<link rel="stylesheet" href="/css/main.css" type="text/css">
	</head>
	<body>
		
		<div id="doc4" class="yui-t2">
			<div id="hd"><h1>Tweetanium</h1></div>
			<div id="bd">
				<div id="yui-main">
					<div class="yui-b">
						<div class="yui-gc">
							<div class="yui-u first" id="timeline">
							</div>
							<div class="yui-u" id="userInfo">
							</div>
						</div>
					</div>
				</div>
				<div class="yui-b">
					<ul>
						<? if (!isset($_SESSION['access_token'])) { ?>
							<li><a href="?login">Login</a></li>
						<? } else { ?>
							<li><a href="#timeline=home">Home</a></li>
							<li><a href="#timeline=mentions">Mentions</a></li>
							<li><a href="#timeline=sent">Sent</a></li>
							<li><a href="#timeline=favorites">Favorites</a></li>
							<li><a href="#timeline=dmin">DM - Received</a></li>
							<li><a href="#timeline=dmout">DM - Sent</a></li>
							<li><a href="?logout">Logout</a></li>
						<? } ?>
					</ul>
					
					<hr />
					
					<div>Next update: <span id="countdown"></span></div>
					<div>Paused: <span class="pseudolink" id="link-pause">Off</span></div>
					<div>Stopped: <span class="pseudolink" id="link-stop">Off</span></div>
					
					<hr />
					<div class="bold">Rate Limiting</div>
					<div><span class="bold">Hits remaining</span>: <span id="rate-remaining-hits"></span></div> 
					<div><span class="bold">Reset</span>: <span  id="rate-reset-time"></span></div>
					
				</div>
			</div>
			<div id="ft"><p>An @derek production</p></div>
		</div>
		
		
		<script>
			
			var _refresh 	= null;
			//var _since_id 	= null;
			
			try { console.log(''); } catch(e) { console = { log: function() {}}; }

			YUI({combo:true}).use('node', 'io-base', 'json', 'selector-css3', 'anim-base', function(Y) {
				
				function getHashStringParameter(parameter){
					var queryString = {};
					var parameters  = window.location.hash.substring(1).split('&');
					var pos, paramname, paramval;

					for (var i in parameters) {
						pos = parameters[i].indexOf('=');
						if (pos > 0) {
							paramname = parameters[i].substring(0,pos);
							paramval  = parameters[i].substring(pos+1);
							queryString[paramname] = unescape(paramval.replace(/\+/g,' '));
						}
						else {
							queryString[parameters[i]] = "";
						}
					}
					return queryString[parameter];
				}
				
				function refreshState() {
					newState(true);
				}
				
				function newState(refresh) {
					var refresh  = refresh || false;
					var timeline = getHashStringParameter('timeline');
					var url = null;
					
					switch(timeline) {
						default:
						case "home":
							url = 'http://www.twitter.com/statuses/home_timeline.json';
							http_method = "GET";
							break;

						case "mentions":
							url = 'http://www.twitter.com/statuses/replies.json';
							http_method = "GET";
							break;

						case "retweets":
							url = 'http://api.twitter.com/1/statuses/retweets_of_me.json';
							http_method = "GET";
							break;

						case "sent":
							url = 'http://www.twitter.com/statuses/user_timeline.json';
							http_method = "GET";
							break;

						case "public":
							url = 'http://www.twitter.com/statuses/public_timeline.json';
							http_method = "GET";
							break;

						case "favorites":
							url = 'http://www.twitter.com/favorites.json';
							http_method = "GET";
							break;

						case "dmin":
							url = 'http://www.twitter.com/direct_messages.json';
							http_method = "GET";
							break;

						case "dmout":
							url = 'http://www.twitter.com/direct_messages/sent.json';
							http_method = "GET";
							break;

					}
					url = "/proxy.php?url=" + url;
					
					
					if (refresh)
					{
						$(".tweet").each(function(i, t){
							id = $(t).attr('id').replace("tweetid-", "");
							if (id > _since_id)
							{
								_since_id = id;
							}
						});
					}
					else
					{
						_since_id = 1;
					}
					
					console.log("All tweets since " + _since_id);
					
					Y.io(url, {
						method: http_method,
						data: "since_id=" + _since_id,
						on: {
							start: function(){
								console.log("xhr:start - url:" + url);
								if (refresh === false)
									Y.one("#timeline").setContent("Loading...");
							},
							complete: function(id, response, args){
								console.log("xhr:complete");
								response = Y.JSON.parse(response.responseText);
							    if (response.error) {
									errorHandler(response.error);
								}
								else {
									console.log("Got (" + response.length + ") tweets");
									
									if (refresh === false)
										Y.one("#timeline").setContent("-");
									response = response.reverse();
									clearTimeout(_refresh);
									_refresh = setTimeout(refreshState, 60000);
									Y.one("#countdown").set("innerHTML", "60");
									tweetHandler(response);
								}
							},
							end: function(){
								console.log("xhr:end");
							},
						}
					})
										
					
					//Y.one("#timeline").setContent(window.location.hash);
				}
				
				function getRateLimitStatus() {
					var url = "http://twitter.com/account/rate_limit_status.json";
					url = "/proxy.php?url=" + url;
					
					Y.io(url, {
						method: "GET",
						on: {
							start: function(){
								console.log("xhr:start - url:" + url);
							},
							complete: function(id, response, args){
								console.log("xhr:complete");
								response = Y.JSON.parse(response.responseText);
							    if (response.error) {
									errorHandler(response.error);
								}
								else {
									console.log(response);
									
									Y.one("#rate-remaining-hits").set("innerHTML", response.remaining_hits );
									Y.one("#rate-reset-time").set("innerHTML", response.reset_time );
								}
							},
							end: function(){
								console.log("xhr:end");
							},
						}
					});
					
				}
				
				function tweetHandler(tweets) {
					var hidden = "";
					
					if (Y.all(".tweet").size() > 0) {
						hidden = "hidden";
					}
					console.log(Y.all(".tweet").size() + "-" + hidden);
					
					$("#timeline").prepend("<hr>");
					for(i in tweets)
					{
						var html = [];
						var tweet = tweets[i];
						
						html.push("<div class='tweet " + hidden + "' id='tweetid-" + tweet.id + "'>");
						html.push("		<div>");
						html.push("			<a class='tweet-image' href=''><img src='" + tweet.user.profile_image_url + "' height='50' width='50'></a>");
						html.push("		</div>");
						html.push("		<div class='tweet-body'>");
						html.push("			<span class='pseudolink username'>" + tweet.user.screen_name + "</span>");
						html.push(": ");
						html.push(tweet.text);
						html.push("		</div>");
						html.push("		<div style='clear:both'></div>");
						html.push("</div>");
						
						html = html.join('');
						$("#timeline").prepend(html);
					}
				}
				
				function errorHandler(message) {
					alert("Error: " + message);
				}
				
				function pauseHandler(){
					if (Y.one("#link-pause").get("innerHTML") == "Off")
					{
						Y.one("#link-pause").setContent("On");
					}
					else
					{
						Y.one("#link-pause").setContent("Off");
					}
				}
				
				function stopHandler() {
					Y.one("#link-stop").setContent("Stopped");
					clearTimeout(_refresh);
				}
				
				function userHandler(e){
					var username = Y.one(e.target).get("innerHTML");
					var url = "http://twitter.com/users/show.json";
					url = "/proxy.php?url=" + url;

					Y.io(url, {
						method: "GET",
						data: "screen_name=" + username,
						on: {
							start: function(){
								console.log("xhr:start - url:" + url);
							},
							complete: function(id, response, args){
								console.log("xhr:complete");
								response = Y.JSON.parse(response.responseText);
							    if (response.error) {
									errorHandler(response.error);
								}
								else {
									var user = response;
									console.log(response);
									
									var html = [];
									html.push("<div><img src='http://img.tweetimag.es/i/" + user.screen_name + "_o' alt='" + user.screen_name + "' width='250' /></div>");
									html.push("<p><span class='bold'>Name</span> " + user.name  + "</p>");
									html.push("<p><span class='bold'>Location</span> " + user.location  + "</p>");
									html.push("<p><span class='bold'>Web</span> <a href='" + user.url  + "' target='_blank'>" + user.url  + "</a></p>");
									html.push("<p><span class='bold'>Bio</span> " + user.description  + "</p>");
									html.push("<p><span class='bold'>Followers</span> " + user.followers_count  + "</p>");
									html.push("<p><span class='bold'>Following</span> " + user.friends_count  + "</p>");
									html.push("<p><span class='bold'>Updates</span> " + user.statuses_count  + "</p>");
									html = html.join('');
									Y.one("#userInfo").setContent(html);
								}
							},
							end: function(){
								console.log("xhr:end");
							},
						}
					});
				}
				
				// Load the initial state and loop to detect any URL Hash changes
				newState();
				(function () {
					lastHash = location.hash;
					return setInterval(function() {
					    if(lastHash !== location.hash) {
					    	lastHash = location.hash;
							newState();
					    }
					}, 50);
				})()
				
				setInterval(function(){
					var current = Y.one("#countdown").get("innerHTML");
					current = parseInt(current);
					Y.one("#countdown").set("innerHTML", current-1);
				}, 1000);
				
				getRateLimitStatus();
				setInterval(getRateLimitStatus, 300000);
				
				Y.on('click', pauseHandler, '#link-pause');
				Y.on('click', stopHandler, '#link-stop');
				Y.delegate('click', userHandler, '#timeline', '.username');
			});
			
			// Show any hidden tweets
			setInterval(function(){
				if ($(".tweet:hidden").length > 0 && $("#link-pause").html() == "Off")
				{
					$(".tweet:hidden:last").slideDown("fast");
				}
			},300);
			
		</script>
	</body>
</html>
