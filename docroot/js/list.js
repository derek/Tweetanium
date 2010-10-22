"use strict";

/*globals
	YUI: true,
*/

YUI.add('List', function (Y) {

	Y.List = {
		init : function (data) {
			this.data = data;
		},
		
		asHtml: function () {
			var data;
			
			data = this.data;
			
			return (function () {
				var html;
				
				html = [];
				
				html.push("<li class='list'>");
				html.push(" <div><a href='#list={uri}'>{name}</a></div>");
				html.push("</li>");

				html = html.join('').supplant(data);

				return html;
			}());
		}
	}; // End of List

}, '0.0.1', { requires: ['io-base'] });