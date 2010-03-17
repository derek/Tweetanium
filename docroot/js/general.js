
/*global 
	window: true, 
	YUI: true, 
	unescape: true,
	console: true
*/

// Globals
var Timelines = [];


// Helper functions
function getHashStringParameter(parameter){
	var parameters, pos, paramname, paramval, queryString;
	
	queryString = {};
	parameters  = window.location.hash.substring(1).split('&');
	
	for (var i in parameters) {
		if (parameters.hasOwnProperty(i)) {
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
	}
	
	if (queryString[parameter]) {
		return queryString[parameter];
	}
	else {
		return false;
	}
}

function relative_time(parsed_date) {
	var relative_to, delta;
	
	relative_to = (arguments.length > 1) ? arguments[1] : new Date();
	delta = parseInt((relative_to.getTime() - parsed_date) / 1000, 10) + (relative_to.getTimezoneOffset() * 60);

	if (delta < 60) {
		return 'less than a minute ago';
	} else if(delta < 120) {
		return 'a minute ago';
	} else if(delta < (45*60)) {
		return (parseInt((delta / 60), 10)).toString() + ' minutes ago';
	} else if(delta < (90*60)) {
		return 'an hour ago';
	} else if(delta < (24*60*60)) {
		return '' + (parseInt((delta / 3600), 10)).toString() + ' hours ago';
	} else if(delta < (48*60*60)) {
		return '1 day ago';
	} else {
		return (parseInt((delta / 86400), 10)).toString() + ' days ago';
	}
}

function addslashes(str) {
	return str.replace(/\\/g,'\\\\').replace(/\'/g,'\\\'').replace(/\"/g,'\\"').replace(/\0/g,'\\0');
}

function stripslashes(str) {
	return str.replace(/\\'/g,'\'').replace(/\\"/g,'"').replace(/\\0/g,'\0').replace(/\\\\/g,'\\');
}

function html_entity_decode(str)
{
    try
	{
		var temp, val;
		temp = document.createElement('textarea');
		temp.innerHTML = str;
		return temp.value;
	}
	catch(e)
	{
		//for IE add <div id="htmlconverter" style="display:none;"></div> to the page
		document.getElementById("htmlconverter").innerHTML = '<textarea id="innerConverter">' + str + '</textarea>';
		var content = document.getElementById("innerConverter").value;
		document.getElementById("htmlconverter").innerHTML = "";
		return content;
	}
}


window.onscroll = function() {
	var st, wh, coverage, docHeight, t, where, offset;

	/* <auto-update> */
    st = (document.documentElement.scrollTop || document.body.scrollTop);
    wh = (window.innerHeight && window.innerHeight < Y.DOM.winHeight()) ? window.innerHeight : Y.DOM.winHeight();

	coverage = st + wh;
	docHeight = Y.DOM.docHeight();

	if (coverage >= (docHeight - 0) && allowUpdate) {
		t = window.Timelines[0];
		where = {
			field : "max_id",
			value : t.lowestTweetId() - 1
		};
		t.addBucket("append").getTweets(t.config, where);
	
		allowUpdate = false;
		setTimeout(unlockUpdating, 3000);
	}
	/* </auto-update> */
	
	/* <sticky sidebox> */
		offset = 30;
		if( window.XMLHttpRequest ) {
			//Moving
			if (document.documentElement.scrollTop > offset || window.pageYOffset > offset) {
				document.getElementById('sidebox').style.position = 'fixed';
				document.getElementById('sidebox').style.top = 0;
			} 
			// At top
			else if (document.documentElement.scrollTop < offset || window.pageYOffset < offset) {
				document.getElementById('sidebox').style.position = 'absolute';
				document.getElementById('sidebox').style.top = offset + 'px';
			}
		}
	/* </sticky sidebox> */
};


// To prevent the "Console is undefined" bug
try { console.log('Console ready...'); } catch(e) { console = { log: function() {}}; }