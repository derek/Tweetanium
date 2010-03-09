<?
	require_once('../config.php');
	
	header("Content-type: application/json");
	
	$connection = new TwitterOAuth(TWITTER_OAUTH_CONSUMER_KEY, TWITTER_OAUTH_CONSUMER_SECRET, $_SESSION['access_token']['oauth_token'], $_SESSION['access_token']['oauth_token_secret']);

	$yql = $_REQUEST['yql'];
	
		if (!isset($_SESSION['access_token']))
		{
			echo json_encode(array(
				"error"	=> "You are not logged in"
			));
			die();
		}
		else
		{
			$yql = str_replace("#oauth#", " oauth_consumer_key='" . TWITTER_OAUTH_CONSUMER_KEY . "' 
			AND oauth_consumer_secret = '" . TWITTER_OAUTH_CONSUMER_SECRET . "' 
			AND oauth_token = '" . $_SESSION['access_token']['oauth_token'] . "' 
			AND oauth_token_secret = '" . $_SESSION['access_token']['oauth_token_secret'] . "' ", $yql);

			$yql = str_replace("#oauth_consumer_key#", 		TWITTER_OAUTH_CONSUMER_KEY, $yql);
			$yql = str_replace("#oauth_consumer_secret#", 	TWITTER_OAUTH_CONSUMER_SECRET, $yql);
			$yql = str_replace("#oauth_token#", 			$_SESSION['access_token']['oauth_token'], $yql);
			$yql = str_replace("#oauth_token_secret#", 		$_SESSION['access_token']['oauth_token_secret'], $yql);
		}
	
	$yql = stripslashes($yql);
	//die($yql);
	
	$url = "https://query.yahooapis.com/v1/public/yql?q=" . urlencode($yql) . "&format=json&diagnostics=false&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
	
    $ch = curl_init($url) ;
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1) ;
	
	if ($_SERVER['REQUEST_METHOD'] == "POST")
	{
		curl_setopt($ch, CURLOPT_POST, true); 
		curl_setopt($ch, CURLOPT_POSTFIELDS, array());  
	}

    $response = curl_exec($ch) ;
    curl_close($ch) ;

	$json = json_decode($response);
	
	//unset($json->query->uri); // We never want this returned
	
	echo json_encode($json->query);
?>