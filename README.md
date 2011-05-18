Tweetanium
==========

A Pure JavaScript Twitter Client.

A few years ago I was working on [Tweenky](//github.com/derek/tweenky), a jQuery/PHP Twitter client.  I learned a lot from that project, but for a variety of reasons I decided to start over from scratch and write another one.  So, I started this project with the goal of doing it in 100% JavaScript, using YUI and YQL.  

While Tweetanium uses OAuth to authenticate with Twitter, there is no server-side code, and this is made possible by using YQL in place of any server-side OAuth proxy.  You can read more about it here, [How-to: Secure OAuth in JavaScript](http://derekville.net/2010/how-to-secure-oauth-in-javascript/).

After initially launching this project at [tweetanium.net](//tweetanium.net), my development efforts go in spurts.  I'm not going to claim it's the best or most featured Twitter client out there, it's simply a playground for me to experiment with.

If you like it, feel free to fork it and run on your own box.  Being written in JS, it only uses static files and does not need a webserver to run and can just run it locally.  If you do run it locally, Twitter will not OAuth callback to a file:// URL, so you will have to add in your OAuth keys (oauth_token & oauth_token_secret)  into your HTML5 Local Storage container as well as create your own YQL datatable with your own OAuth consumer keys. See above blog post for more info.

To prove it works without any server-side code, you can check it out on Github Pages at [derek.github.com/Tweetanium/](http://derek.github.com/Tweetanium/)

License Information
-------------------
Tweetanium has an [MIT license](https://secure.wikimedia.org/wikipedia/en/wiki/MIT_License).