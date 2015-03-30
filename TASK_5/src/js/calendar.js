var $ = require('./nojquery.js'),
// var $ = require('jquery-browserify'),
	daysNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
	monthNames = [
		'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
		'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
	]
;

function Calendar(elem, options) {
	var $calendar = this;

	this._builtInLayouts = {
		months: {
			itemByRow: 4,
			itemByCol: 3,
			finalizer: function(x, y, elem) {
				elem.click(function() {
					if ($(this).hasClass('calendar-data-cell-enabled')) {
						$calendar.renderDaysPage($(this).data('month'), $(this).data('year'));
					}
				});
			}
		},
		days: {
			itemByRow: 7,
			itemByCol: 7,
			finalizer: function(x, y, elem) {
				if (y !== 0) {
					elem.click(function() {
						if ($(this).hasClass('calendar-data-cell-enabled')) {
							$calendar.date($(this).data('date'));
						}
					});
					return;
				}
				if (daysNames.length > x && x >= 0) {
					elem
						.addClass('calendar-data-cell-title')
						.text(daysNames[x]);
				}
			}
		},
		years: {
			itemByRow: 5,
			itemByCol: 4,
			finalizer: function(x, y, elem) {
				elem.click(function() {
					if ($(this).hasClass('calendar-data-cell-enabled')) {
						$calendar.renderMonthPage($(this).data('year'));
					}
				});
			}
		}
	}

	this._normalizeDay = function(day) {
		if (day == 0) {
			day = 7;
		}
		return day - 1;
	}

	this._addLeadNulls = function(value, maxLen) {
		value += '';
		var nullLen = maxLen - value.length;
		for (var i = 0; i < nullLen; i++) {
			value = '0' + value;
		}
		return value;
	}

	this._toDate = function(value) {
		var date = null;
		if (typeof(value) === 'string') {
			date = new Date(value);
			if (date.toString() === 'Invalid Date') {
				console.log('Warn: Calendar.prototype.date() Invalid Date value = ' + value);
				return null;
			}
		} else if (typeof(value) === 'object' && value.constructor.name === 'Date') {
			date = value;
		} else {
			return null;
		}
		return date;		
	}

	this._equal = function(a, b, precision) {
		if (typeof(a) === 'undefined' || typeof(b) === 'undefined') {
			return false;
		}
		var dateEq = a.getDate() === b.getDate(),
			monthEq = a.getMonth() === b.getMonth(),
			yearEq = a.getFullYear() === b.getFullYear()
		;
		switch (precision) {
			case 'date':
				return dateEq && monthEq && yearEq;
			case 'month':
				return monthEq && yearEq;
			case 'year':
				return yearEq;
			default:
				return false;
		}
	}

	this.elem = elem;
	this.view = {};
	this.layout = {
		name: 'custom'
	};
	this.data = {
		today: new Date(),
		page: {}
	};
	this
		.renderView()
		.renderDaysPage(this.data.today.getMonth(), this.data.today.getFullYear())
	;
	elem.data('calendar', this);
}

Calendar.prototype.renderView = function() {
	$calendar = this;
	this.elem.children().remove();
	this.elem
		.append(
			this.view.wrapper = $('<div></div>')
				.addClass('calendar-wrapper')
				.append(
					$('<div></div>')
						.addClass('calendar-input')
						.append(
							this.view.input = $('<input></input>')
								.addClass('calendar-input')
								.click(this.inputClick.bind($calendar))
								.keypress(this.inputKeyPress.bind($calendar))
						)
						.append(
							this.view.searchBtn = $('<div></div>')
								.addClass('calendar-search-btn')
								.click(this.searchClick.bind($calendar))
						)
				)
				.append(
					this.view.main = $('<div></div>')
						.addClass('calendar-main')
						.append(
							this.view.menu = $('<div></div>')
								.addClass('calendar-selector')
								.append(
									this.view.prevBtn = $('<div></div>')
										.addClass('calendar-prev-btn')
										.click(this.prevClick.bind($calendar))
										.text('<')
								)
								.append(
									this.view.info = $('<div></div>')
										.addClass('calendar-info')
										.click(this.infoClick.bind($calendar))
										.text('Сентябрь 2015')
								)
								.append(
									this.view.nextBtn = $('<div></div>')
										.addClass('calendar-next-btn')
										.click(this.nextClick.bind($calendar))
										.text('>')
								)
						)
						.append(
							this.view.data = $('<div></div>')
								.addClass('calendar-data')
						)
						.append(
							this.view.hideBtn = $('<div></div>')
								.addClass('calendar-hide-btn')
								.click(this.hideClick.bind($calendar))
								.text('Скрыть')
						)
				)
		)
	;
	return this;
}

//Calendar actions

Calendar.prototype.date = function(value) {
	var inDate;
	if (typeof(value) === 'undefined') {
		return this.data.selected;
	}
	if (!(inDate = this._toDate(value))) {
		return this;
	}
	this.data.selected = inDate;
	this.renderDaysPage(inDate.getMonth(), inDate.getFullYear());
	this.view.input.val([
		this._addLeadNulls(inDate.getDate(), 2),
		this._addLeadNulls(inDate.getMonth() + 1, 2),
		this._addLeadNulls(inDate.getFullYear(), 4)
	].join('.'));
	return this;
}

//Calendar internal actions

Calendar.prototype.renderDaysPage = function(month, year) {
	if (this.layout.name !== 'days') {
		this.setLayout('days');
	}
	var dps = this.data.page.starts = new Date();
	dps.setDate(1);
	dps.setMonth(this.data.page.month = month);
	dps.setFullYear(this.data.page.year = year);
	while (this._normalizeDay(dps.getDay()) !== 0) {	
		dps.setDate(dps.getDate() - 1);
	}
	var dpe = this.data.page.ends = new Date(dps),
		items = this.view.items
	;
	for (var y = 1; y < this.layout.colCnt; y++) {
		for (var x = 0; x < this.layout.rowCnt; x++) {
			items[y][x]
				.text(dpe.getDate())
				.data('x', x)
				.data('y', y)
				.data('date', new Date(dpe))
				.removeClass('calendar-data-cell-enabled')
				.removeClass('calendar-data-cell-today')
				.removeClass('calendar-data-cell-disabled')
				.removeClass('calendar-data-cell-selected')
				.removeClass('calendar-data-cell-weekend')
				.addClass(dpe.getMonth() === month ? 'calendar-data-cell-enabled' : 'calendar-data-cell-disabled')
			;
			if (this.data.selected !== 'undefined' && this._equal(this.data.selected, dpe, 'date')) {
				items[y][x].addClass('calendar-data-cell-selected');
			}
			if (this.data.today !== 'undefined' && this._equal(this.data.today, dpe, 'date')) {
				items[y][x].addClass('calendar-data-cell-today');
			}
			if (x > 4) {
				items[y][x]
					.addClass('calendar-data-cell-weekend');
			}
			dpe.setDate(dpe.getDate() + 1);
		}
	}
	this.view.info.text(monthNames[month] + ' ' + year);
	return this;
}

Calendar.prototype.renderMonthPage = function(year) {
	if (this.layout.name !== 'months') {
		this.setLayout('months');
	}
	var ms = this.data.page.starts = 0;
		ys = this.data.page.year = (
			year 
				? year 
				: this.data.selected
					? this.data.selected.getFullYear()
					: this.data.today.getFullYear()
		),
		year = ys,
		items = this.view.items
	;
	for (var y = 0; y < this.layout.colCnt; y++) {
		for (var x = 0; x < this.layout.rowCnt; x++) {
			items[y][x]
				.text(monthNames[ms])
				.data('x', x)
				.data('y', y)
				.data('month', ms)
				.data('year', ys)
				.removeClass('calendar-data-cell-enabled')
				.removeClass('calendar-data-cell-disabled')
				.removeClass('calendar-data-cell-today')
				.addClass('calendar-data-cell-month')
				.addClass(ys === year ? 'calendar-data-cell-enabled' : 'calendar-data-cell-disabled')
			;
			if (this.data.today !== 'undefined' && this._equal(this.data.today, new Date((ms + 1) + '.01.' + ys), 'month')) {
				items[y][x]
					.addClass('calendar-data-cell-today');
			}
			if (this.data.selected !== 'undefined' && this._equal(this.data.selected, new Date((ms + 1) + '.01.' + ys), 'month')) {
				items[y][x]
					.addClass('calendar-data-cell-selected');
			}
			if (ms === 11) {
				ms = 0;
				ys++;
			} else {
				ms++;
			}
		}
	}
	this.view.info.text(year);
	return this;
}

Calendar.prototype.renderYearPage = function() {
	if (this.layout.name !== 'years') {
		this.setLayout('years');
	}
	var ys = this.data.page.starts = (
		this.data.page.year
			? this.data.page.year
			: this.data.selected
				? this.data.selected.getFullYear()
				: this.data.today.getFullYear()
		),
		items = this.view.items

	;
	for (var y = 0; y < this.layout.colCnt; y++) {
		for (var x = 0; x < this.layout.rowCnt; x++) {
			items[y][x]
				.text(ys)
				.data('x', x)
				.data('y', y)
				.data('year', ys)
				.removeClass('calendar-data-cell-today')
				.removeClass('calendar-data-cell-selected')
				.addClass('calendar-data-cell-enabled')
			;
			if (this.data.today !== 'undefined' && this._equal(this.data.today, new Date('01.01.' + ys), 'year')) {
				items[y][x]
					.addClass('calendar-data-cell-today');
			}
			if (this.data.selected !== 'undefined' && this._equal(this.data.selected, new Date('01.01.' + ys), 'year')) {
				items[y][x]
					.addClass('calendar-data-cell-selected');
			}
			ys++;
		}
	}
	this.data.page.ends = ys - 1;
	this.view.info.text(this.data.page.starts + ' - ' + this.data.page.ends);
	return this;
}

Calendar.prototype.getDayPosition = function(date) {
	if (this.layout !== 'days' || this.data.page.starts === undefined || date < this.data.page.starts || this.data.page.ends === undefined || date > this.data.page.ends) {
		return {x: -1, y: -1};
	}
	var iterator = new Date(this.data.page.starts);
	for (var y = 1; y < this.layout.colCnt; y++) {
		for (var x = 0; x < this.layout.rowCnt; x++) {
			if (iterator.getMonth() === date.getMonth() && iterator.getDate() === date.getDate()) {
				return {x: x, y: y};
			}
			iterator.setDate(iterator.getDate() + 1);
		}
	}
}

Calendar.prototype.openIfNotOpened = function() {
	if (!this.view.main.hasClass('calendar-fullsize')) {
		this.view.main.toggleClass('calendar-fullsize');
	}
	return this;
}

Calendar.prototype.close = function() {
	this.view.main.removeClass('calendar-fullsize');
	return this;
}

Calendar.prototype.setLayout = function(layout) {
	var itemByRow = 1,
		itemByCol = 1,
		finalizer
	;
	if (this._builtInLayouts.hasOwnProperty(layout) >= 0) {
		itemByRow = this._builtInLayouts[layout].itemByRow;
		itemByCol = this._builtInLayouts[layout].itemByCol;
		finalizer = this._builtInLayouts[layout].finalizer;
	} else {
		layout = 'custom';
	}
	this.layout = {
		name: layout,
		colCnt: itemByCol,
		rowCnt: itemByRow
	}
	return this.createPlaces(finalizer);
}

Calendar.prototype.createPlaces = function(finalize) {
	if (this.layout.colCnt * this.layout.rowCnt == 0) {
		return this;
	}
	var dataHeight = this.view.data.height(),
		dataWidth = this.view.data.width(),
		itemWidth = dataWidth / this.layout.rowCnt - 1,
		itemHeight = itemWidth,
		row,
		table
	;
	this.view.data.children().remove();
	this.view.items = [];
	this.view.data.append(
		$('<table></table>')
			.addClass('calendar-data-table')
			.append(table = $('<tbody></tbody>'))
	);
	for (var y = 0; y < this.layout.colCnt; y++) {
		table.append(row = $('<tr></tr>'));
		this.view.items.push([]);
		for (var x = 0; x < this.layout.rowCnt; x++) {
			var item = $('<td></td>')
				.addClass('calendar-data-cell')
				.height(itemHeight)
				.width(itemWidth)
			;
			if (typeof(finalize) === 'function') {
				finalize(x, y, item);
			}
			this.view.items[y][x] = item;
			row.append(item);
		}
	}
	return this;
}

//Calendar events

Calendar.prototype.hideClick = function() {
	this.close();
	return this;
}

Calendar.prototype.searchClick = function() {
	var value = this.view.input.val(),
		rdate = /^\D*?(\d+)\D+?(\d+)\D+?(\d+)\D*?$/,
		match = rdate.exec(value)
	;
	if (match && match[0] && match[1] && match[2] && match[3]) {
		return this
			.date([match[2], match[1], match[3]].join('.'))
			.openIfNotOpened();
	}
	return this.openIfNotOpened();
}

Calendar.prototype.inputKeyPress = function(e) {
	e = e || window.event;
	if (e.ctrlKey || e.altKey || e.metaKey) {
		return this;
	}
	if (e.which == null && ekeyCode === 13 || (e.which != 0 && event.charCode === 13)) {  // IE
		return this.searchClick();
	}
	return this;
}

Calendar.prototype.inputClick = function() {
	// return this.openIfNotOpened();
}

Calendar.prototype.prevClick = function() {
	console.log('prev click');
	if (this.layout.name === 'days') {
		if (this.data.page.month === 0) {
			this.data.page.month = 11;
			this.data.page.year--;
		} else {
			this.data.page.month--;
		}
		this.renderDaysPage(this.data.page.month, this.data.page.year);
	} else if (this.layout.name === 'months') {
		this.data.page.year--;
		this.renderMonthPage(this.data.page.year);
	} else if (this.layout.name === 'years') {
		this.data.page.year = this.data.page.starts - this.layout.colCnt * this.layout.rowCnt;
		this.renderYearPage();
	}
	return this;
}

Calendar.prototype.nextClick = function() {
	console.log('next click');
	if (this.layout.name === 'days') {
		if (this.data.page.month === 11) {
			this.data.page.month = 0;
			this.data.page.year++;
		} else {
			this.data.page.month++;
		}
		this.renderDaysPage(this.data.page.month, this.data.page.year);
	} else if (this.layout.name === 'months') {
		this.data.page.year++;
		this.renderMonthPage(this.data.page.year);
	} else if (this.layout.name === 'years') {
		this.data.page.year = this.data.page.ends + 1;
		this.renderYearPage();
	}
	return this;
}

Calendar.prototype.infoClick = function() {
	switch (this.layout.name) {
		case 'days':
			this.renderMonthPage(this.data.page.year);
			break;
		case 'months':
			this.renderYearPage();
			break;
	}
	return this;
}

module.exports = function factory(elem, options) {
	return new Calendar(elem, options);
}