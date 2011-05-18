/*global 
	unescape: true,
	window: true,
	YUI: true,
*/

// Globals
var Timelines = [];


// Helper functions
function getHashStringParameter(parameter) {
	var i, parameters, pos, paramname, paramval, queryString;
	
	queryString = {};
	parameters  = window.location.hash.substring(1).split('&');
	
	for (i in parameters) {
		if (parameters.hasOwnProperty(i)) {
			pos = parameters[i].indexOf('=');
			if (pos > 0) {
				paramname = parameters[i].substring(0, pos);
				paramval = parameters[i].substring(pos + 1);
				queryString[paramname] = unescape(paramval.replace(/\+/g, ' '));
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

function getQueryStringParameter(key, queryString)
{
	//TODO: Cleanup
	var queryString = queryString || window.location.href;
	key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regex = new RegExp("[\\?&]"+key+"=([^&#]*)");
	var qs = regex.exec(queryString);
	if (qs)
		return qs[1];
	else
		return false;
}


function relative_time(parsed_date) {
	var relative_to, delta;
	
	relative_to = (arguments.length > 1) ? arguments[1] : new Date();
	delta = parseInt((relative_to.getTime() - parsed_date) / 1000, 10) + (relative_to.getTimezoneOffset() * 60);

	if (delta < 60) {
		return 'less than a minute ago';
	} else if (delta < 120) {
		return 'a minute ago';
	} else if (delta < (45 * 60)) {
		return (parseInt((delta / 60), 10)).toString() + ' minutes ago';
	} else if (delta < (90 * 60)) {
		return 'an hour ago';
	} else if (delta < (24 * 60 * 60)) {
		return '' + (parseInt((delta / 3600), 10)).toString() + ' hours ago';
	} else if (delta < (48 * 60 * 60)) {
		return '1 day ago';
	} else {
		return (parseInt((delta / 86400), 10)).toString() + ' days ago';
	}
}

function addslashes(str) {
	return str.replace(/\\/g, '\\\\').replace(/\'/g, '\\\'').replace(/\"/g, '\\"').replace(/\0/g, '\\0');
}

function stripslashes(str) {
	return str.replace(/\\'/g, '\'').replace(/\\"/g, '"').replace(/\\0/g, '\\0').replace(/\\\\/g, '\\');
}

function html_entity_decode(str) {
	var temp;
	
    try {
		temp = document.createElement('textarea');
		temp.innerHTML = str;
		return temp.value;
	}
	catch (e) {
		//for IE add <div id="htmlconverter" style="display:none;"></div> to the page
		document.getElementById("htmlconverter").innerHTML = '<textarea id="innerConverter">' + str + '</textarea>';
		temp = document.getElementById("innerConverter").value;
		document.getElementById("htmlconverter").innerHTML = "";
		return temp;
	}
	
}

// To prevent the "Console is undefined" bug
try { 
	console.log('Console ready...'); 
} 
catch (e) { 
	console = { 
		log: function () {}
	}; 
}