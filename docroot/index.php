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
		<link rel="stylesheet" href="http://yui.yahooapis.com/2.7.0/build/reset-fonts-grids/reset-fonts-grids.css" type="text/css">
		<link rel="stylesheet" href="/css/main.css" type="text/css">
	</head>
	<body>
		
		<div id="doc4" class="yui-t1">
			<div id="hd"><h1>Tweetanium</h1></div>
			<div id="bd">
				<div id="yui-main">
					<div class="yui-b">
						<div class="yui-ge">
							<div class="yui-u first" id="timeline">
								<div style='border-bottom:solid #bfbfbf 2px'>
									<img height="50" width="50" src="http://a3.twimg.com/profile_images/295683345/self1_normal.jpg">
									<textarea id="compose-status" style="height:38px;width:517px;padding:5px 5px 5px 5px; float:Right;font-size:15px;"></textarea>
									<div style="clear:both"></div>
									<div style="float:right;">
										<span id="character-count">140</span>
										<input type="button" value="update" id="update-status" />
									</div>
									<div style="clear:both"></div>
								</div>
								<div style="clear:both"></div>
								<div class="inner"></div>
							</div>
							<div class="yui-u hidden" id="sidebox">
								<div align="right" class="pseudolink" id="link-close-sidebox">Close</div>
								<div class="inner"></div>
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
					
					<ul id="lists"></ul>
					<hr />
					
					<ul id="trends"></ul>
					<hr />
					
					<div>Hits remaining: <span id="rate-remaining-hits"></span></div> 
					<div>Resets in: <span id="rate-reset-time"></span> min.</div>
					
				</div>
			</div>
			
			<div id="ft"><p>An @derek production</p></div>
			
			<div id="sidebox" class="hidden">
				<div id="link-close-sidebox" class="pseudolink" align="right">Close</div>
				<div class="inner"></div>
			</div>
			
		</div>
		
		<script>
			_user_id = '<?= $_SESSION['access_token']['user_id'] ?>';
			_screen_name = '<?= $_SESSION['access_token']['screen_name'] ?>';
		</script>
		<script type="text/javascript" src="http://yui.yahooapis.com/3.0.0/build/yui/yui-min.js"></script>
		<script type="text/javascript" src="/js/crock.js"></script>
		<script type="text/javascript" src="/js/general.js"></script>
	</body>
</html>
