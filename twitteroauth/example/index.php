<?php

require_once('../twitterOAuth.php');

session_start();


if ($_REQUEST['test'] === 'clear') {
  	session_destroy();
  	session_start();
}

$consumer_key 		= 'lPkmfsdV4B3d2bLcnkdlg';
$consumer_secret 	= 'GPSiu7pGYWcLCfKnSsROfFYrQWwFTP9Mb28Xe9uHcs';

$content 		= NULL;
$state 			= $_SESSION['oauth_state'];
$session_token 	= $_SESSION['oauth_request_token'];
$oauth_token 	= $_REQUEST['oauth_token'];
$section 		= $_REQUEST['section'];

/* If oauth_token is missing get it */
if (strlen($_REQUEST['oauth_token']) > 1 && $_SESSION['oauth_state'] === 'start') {
  $_SESSION['oauth_state'] = $state = 'returned';
}

/*
 * Switch based on where in the process you are
 *
 * 'default': Get a request token from twitter for new user
 * 'returned': The user has authorize the app on twitter
 */
switch ($state) 
{
  default:
    $to = new TwitterOAuth($consumer_key, $consumer_secret);
    $tok = $to->getRequestToken();

    /* Save tokens for later */
    $_SESSION['oauth_request_token'] 		= $token = $tok['oauth_token'];
    $_SESSION['oauth_request_token_secret'] = $tok['oauth_token_secret'];
    $_SESSION['oauth_state'] 				= "start";

    /* Build the authorization URL */
    $request_link = $to->getAuthorizeURL($token);

    /* Build link that gets user to twitter to authorize the app */
    $content = '<br /><a href="'.$request_link.'">'.$request_link.'</a>';
    break;
  case 'returned':
    if ($_SESSION['oauth_access_token'] === NULL && $_SESSION['oauth_access_token_secret'] === NULL) {
      $to 	= new TwitterOAuth($consumer_key, $consumer_secret, $_SESSION['oauth_request_token'], $_SESSION['oauth_request_token_secret']);
      $tok 	= $to->getAccessToken();

      $_SESSION['oauth_access_token'] = $tok['oauth_token'];
      $_SESSION['oauth_access_token_secret'] = $tok['oauth_token_secret'];
    }

    $content = '<a href="https://twitter.com/account/connections">https://twitter.com/account/connections</a>';

    $to = new TwitterOAuth($consumer_key, $consumer_secret, $_SESSION['oauth_access_token'], $_SESSION['oauth_access_token_secret']);
    $content = $to->OAuthRequest('http://twitter.com/statuses/friends_timeline.xml', array(), 'POST');
    //$content = $to->OAuthRequest('https://twitter.com/statuses/update.xml', array('status' => 'Test OAuth update. #testoauth'), 'POST');
    break;
}
?>

<html>
  <head>
    <title>Twitter OAuth in PHP</title>
  </head>
  <body>
	
    <p><a href='<?php echo $_SERVER['PHP_SELF']; ?>?test=clear'>Logout</a></p>

    <p><pre><?php print_r($content); ?><pre></p>

  </body>
</html>
