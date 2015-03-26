var $ = require('./nojquery.js');

function Calendar(elem, options) {
	this._builtInLayouts = {
		months: {
			itemByRow: 4,
			itemByCol: 3
		},
		days: {
			itemByRow: 7,
			itemByCol: 6
		},
		years: {
			itemByRow: 5,
			itemByCol: 4
		}
	}
	this.elem = elem;
	this.view = {}
	elem.data('calendar', this);
	elem.data('calendar').renderView();
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
							this.view.searchBtn = $('<button></button>')
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
	this.setLayout('months');
}

//Calendar internal actions

Calendar.prototype.openIfNotOpened = function() {
	if (!this.view.main.hasClass('calendar-fullsize')) {
		this.view.main.toggleClass('calendar-fullsize');
		// this.view.hideBtn.removeClass('invisible');
	}	
}

Calendar.prototype.close = function() {
	this.view.main.removeClass('calendar-fullsize');
}

Calendar.prototype.setLayout = function(layout) {
	var itemByRow = 1,
		itemByCol = 1
	;
	if (this._builtInLayouts.hasOwnProperty(layout) >= 0) {
		itemByRow = this._builtInLayouts[layout].itemByRow;
		itemByCol = this._builtInLayouts[layout].itemByCol;
	}
	this.createPlaces(itemByCol, itemByRow);
}

Calendar.prototype.createPlaces = function(itemByCol, itemByRow, finalize) {
	if (itemByCol * itemByRow == 0) {
		return;
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
		for (var x = 0; x < itemByRow; x++) {
			var item = $('<td></td>')
				.class('calendar-data-cell')
				.height(itemHeight)
				.width(itemWidth)
			;
			if (typeof(finalize) === 'function') {
				finalize(x, y, item);
			}
			this.view.items[y * itemByRow + x] = item;
			row.append(item);
		}
	}
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

module.exports = function factory(elem, options) {
	return new Calendar(elem, options);
}