var Calendar = require('./calendar.js'),
	$ = require('./nojquery.js')
;

window.$ = $;

window.onload = function() {
	var calendars = [Calendar($('#calendar-place-1')), Calendar($('#calendar-place-2'))];
}


