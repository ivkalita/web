var $ = require('./nojquery.js'),
	daysNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
	monthNames = [
		'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
		'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
	]
;

function Calendar(elem, options) {
	this._builtInLayouts = {
		months: {
			itemByRow: 4,
			itemByCol: 3,
			finalizer: undefined
		},
		days: {
			itemByRow: 7,
			itemByCol: 7,
			finalizer: function(x, y, elem) {
				if (y !== 0) {
					return;
				}
				if (daysNames.length > x && x >= 0) {
					elem
						.class('calendar-data-cell calendar-data-cell-title')
						.text(daysNames[x]);
				}
			}
		},
		years: {
			itemByRow: 5,
			itemByCol: 4
		}
	}

	this._normalizeDay = function(day) {
		if (day == 0) {
			day = 7;
		}
		return day - 1;
	}

	this.elem = elem;
	this.view = {}
	elem.data('calendar', this);
	elem.data('calendar')
		.renderView()
		.date(new Date())
	;
}

Calendar.prototype.renderView = function() {
	$calendar = this;
	this.elem
		.removeChildren()
		.append(
			this.view.wrapper = $('<div></div>')
				.class('calendar-wrapper')
				.append(
					$('<div></div>')
						.class('calendar-input')
						.append(
							this.view.input = $('<input></input>')
								.class('calendar-input')
								.click(this.inputClick.bind($calendar))
						)
						.append(
							this.view.searchBtn = $('<div></div>')
								.class('calendar-search-btn')
								.click(this.searchClick.bind($calendar))
								.text('F')
						)
				)
				.append(
					this.view.main = $('<div></div>')
						.class('calendar-main')
						.append(
							this.view.menu = $('<div></div>')
								.class('calendar-selector')
								.append(
									this.view.prevBtn = $('<div></div>')
										.class('calendar-prev-btn')
										.click(this.prevClick.bind($calendar))
										.text('<')
								)
								.append(
									this.view.info = $('<div></div>')
										.class('calendar-info')
										.click(this.infoClick.bind($calendar))
										.text('Сентябрь 2015')
								)
								.append(
									this.view.nextBtn = $('<div></div>')
										.class('calendar-next-btn')
										.click(this.nextClick.bind($calendar))
										.text('>')
								)
						)
						.append(
							this.view.data = $('<div></div>')
								.class('calendar-data')
						)
						.append(
							this.view.hideBtn = $('<div></div>')
								.class('calendar-hide-btn')
								.click(this.hideClick.bind($calendar))
								.text('Скрыть')
						)
				)
		)
	;
	return this;
}

//Calendar internal actions

Calendar.prototype.switchMonth = function(month, year) {
	this.daysPageStarts = new Date();
	var dps = this.daysPageStarts;
	dps.setDate(1);
	dps.setMonth(month);
	dps.setFullYear(year);
	while (this._normalizeDay(dps.getDay()) !== 0) {	
		dps.setDate(dps.getDate() - 1);
	}
	this.daysPageEnds = new Date(dps);
	var dpe = this.daysPageEnds,
		items = this.view.items
	;
	for (var y = 1; y < this.itemByCol; y++) {
		for (var x = 0; x < this.itemByRow; x++) {
			items[y][x].text(dpe.getDate());
			dpe.setDate(dpe.getDate() + 1);
		}
	}
	console.log.info(month);
	this.view.info.text(monthNames(month) + ' ' + year);
	return this;
}

Calendar.prototype.getDayPosition = function(date) {
	if (this.daysPageStarts === undefined || date < this.daysPageStarts || this.daysPageEnds === undefined || date > this.daysPageEnds) {
		return {x: -1, y: -1};
	}
	var iterator = new Date(this.daysPageStarts);
	for (var y = 1; y < this.itemByCol; y++) {
		for (var x = 0; x < this.itemByRow; x++) {
			if (iterator.getMonth() === date.getMonth() && iterator.getDate() === date.getDate()) {
				return {x: x, y: y};
			}
			iterator.setDate(iterator.getDate() + 1);
		}
	}
}

Calendar.prototype.refreshView = function(layout, date) {
	if (typeof(date) === 'undefined') {
		date = this.curDate;
	}
	if (this.layout !== layout) {
		this.setLayout(layout);
	}
	if (layout === 'days') {
		var dayPosition = this.getDayPosition(date);
		if (dayPosition.x < 0 || dayPosition.y < 0) {
			this.switchMonth(date.getMonth(), date.getFullYear());
			dayPosition = this.getDayPosition(date);
		}
		this.view.items[dayPosition.y][dayPosition.x].text('sel');
	}
	return this;
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
		this.layout = layout;
		itemByRow = this._builtInLayouts[layout].itemByRow;
		itemByCol = this._builtInLayouts[layout].itemByCol;
		finalizer = this._builtInLayouts[layout].finalizer;
	} else {
		this.layout = 'custom';
	}
	this.itemByCol = itemByCol;
	this.itemByRow = itemByRow;
	return this.createPlaces(itemByCol, itemByRow, finalizer);
}

Calendar.prototype.createPlaces = function(itemByCol, itemByRow, finalize) {
	if (itemByCol * itemByRow == 0) {
		return this;
	}
	var dataHeight = this.view.data.height(),
		dataWidth = this.view.data.width(),
		itemHeight = dataHeight / itemByCol - 1, //border-width = 1px
		itemWidth = dataWidth / itemByRow - 1, //border-width = 1px
		row,
		table
	;
	this.view.data.removeChildren();
	this.view.items = [];
	this.view.data.append(
		$('<table></table>')
			.class('calendar-data-table')
			.append(table = $('<tbody></tbody>'))
	);
	for (var y = 0; y < itemByCol; y++) {
		table.append(row = $('<tr></tr>'));
		this.view.items.push([]);
		for (var x = 0; x < itemByRow; x++) {
			var item = $('<td></td>')
				.class('calendar-data-cell')
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
	return this.openIfNotOpened();
}

Calendar.prototype.inputClick = function() {
	return this.openIfNotOpened();
}

Calendar.prototype.prevClick = function() {
	console.log('prev click');
	return this;
}

Calendar.prototype.nextClick = function() {
	console.log('next click');
	return this;
}

Calendar.prototype.infoClick = function() {
	console.log('info click');
	return this;
}

//Calendar actions

Calendar.prototype.date = function(value) {
	var inDate;
	if (typeof(value) === 'undefined') {
		return this.curDate;
	}
	if (typeof(value) === 'string') {
		inDate = new Date(value);
		if (inDate === 'Invalid Date') {
			console.log('Warn: Calendar.prototype.date() Invalid Date value = ' + value);
			return this;
		}
	}
	if (typeof(value) === 'object' && value.constructor.name === 'Date') {
		inDate = value;
	} else {
		return this;
	}
	this.curDate = inDate;
	this.refreshView('days');
	return this;
}

module.exports = function factory(elem, options) {
	return new Calendar(elem, options);
}