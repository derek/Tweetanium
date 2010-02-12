<?

	require_once('../twitteroauth/twitterOAuth.php');

	session_start();

	if ($_SERVER['HTTP_HOST'] == "tweetanium.net")
	{
		define("TWITTER_OAUTH_CONSUMER_KEY", 	"QaZo1donV0QH3VDYciVBg");
		define("TWITTER_OAUTH_CONSUMER_SECRET", "qSUkF7bZ0WaBBeqezRCedmfOQxzalIqJ8YBxtDiodTo");
		define("TWITTER_OAUTH_CALLBACK", 		"http://tweetanium.net/twitter_callback.php");
	}

?>