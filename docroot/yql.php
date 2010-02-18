<?
	
	require_once('../config.php');
	
	header("Content-type: application/json");
	
	$connection = new TwitterOAuth(TWITTER_OAUTH_CONSUMER_KEY, TWITTER_OAUTH_CONSUMER_SECRET, $_SESSION['access_token']['oauth_token'], $_SESSION['access_token']['oauth_token_secret']);

	$yql = $_GET['yql'];
	
	if (strstr($yql, "#oauth#"))
	{
		$oauth = " oauth_consumer_key='" . TWITTER_OAUTH_CONSUMER_KEY . "' 
		AND oauth_consumer_secret = '" . TWITTER_OAUTH_CONSUMER_SECRET . "' 
		AND oauth_token = '" . $_SESSION['access_token']['oauth_token'] . "' 
		AND oauth_token_secret = '" . $_SESSION['access_token']['oauth_token_secret'] . "' ";
		$yql = str_replace("#oauth#", $oauth, $yql);
	}
	$yql = stripslashes($yql);
	
	$url = "https://query.yahooapis.com/v1/public/yql?q=" . urlencode($yql) . "&format=json&diagnostics=false&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
	
    $ch = curl_init ($url) ;
    curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1) ;
    $response = curl_exec ($ch) ;
    curl_close ($ch) ;
	
	$response = json_decode($response);
	
	echo json_encode($response->query->results);
?>