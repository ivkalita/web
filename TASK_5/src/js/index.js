var Calendar = require('./calendar.js'),
	$ = require('./nojquery.js')
	// $ = require('jquery-browserify')
;

window.$ = $;

window.onload = function() {
	var calendars = [Calendar($('#calendar-place-1')), Calendar($('#calendar-place-2'))];
}


