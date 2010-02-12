<?
	require_once('../config.php');
	
	header("Content-type: application/json");
	
	$connection = new TwitterOAuth(TWITTER_OAUTH_CONSUMER_KEY, TWITTER_OAUTH_CONSUMER_SECRET, $_SESSION['access_token']['oauth_token'], $_SESSION['access_token']['oauth_token_secret']);
	
	if ($_SERVER['REQUEST_METHOD'] == "POST")
	{
		$params = $_POST;
		$url 	= $_POST['url'];
		$method = "post";
	}
	else
	{
		$params = $_GET;
		$url 	= $_GET['url'];
		$method = "get";
	}
	unset($params['url']);

	$params = array_map("stripslashes", $params);
	$response = (array) $connection->$method($url, $params);
	$response = json_encode($response);
	
	echo $response;
	
	die();
?>