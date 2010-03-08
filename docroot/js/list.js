YUI.add('List', function(Y) {

	Y.List = {
		init : function(data) {
			this.data = data;
		},
		
		asHtml: function() {
			data = this.data;
			return function(){
				var html = [];
				
				html.push("<ol class='list'>");
				html.push("		<div>{name}</div>");
				html.push("</ol>");

				html = html.join('').supplant(data);

				return html;
			}();
		}
	}; // End of List

}, '0.0.1', { requires: ['io-base'] });