var	daysNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
	monthNames = [
		'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
		'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
	]
;

var Calendar = new Class({
	inputClick: function() {
		return this.openIfNotOpened();
	},

	searchClick: function() {
		var value = this.view.input.get('value'),
			rdate = /^\D*?(\d+)\D+?(\d+)\D+?(\d+)\D*?$/,
			match = rdate.exec(value)
		;
		if (match && match[0] && match[1] && match[2] && match[3]) {
			if (parseInt(match[3]) < 100) {
				console.log('Warn: Calendar.prototype.searchClick Year will be interpreted as 1900 + year');
			}
			return this
				.date([match[2], match[1], match[3]].join('.'))
				.openIfNotOpened();
		}
		return this.openIfNotOpened();
	},

	hideClick: function() {
		this.view.main.removeClass('calendar-fullsize');
		return this;
	},

	openIfNotOpened: function() {
		if (!this.view.main.hasClass('calendar-fullsize')) {
			this.view.main.toggleClass('calendar-fullsize');
		}
		return this;
	},

	updateInput: function() {
		var addLeadZeroes = function(value, maxLen) {
			value += '';
			var zeroesLen = maxLen - value.length;
			for (var i = 0; i < zeroesLen; i++) {
				value = '0' + value;
			}
			return value;
		}
		var val = [
			addLeadZeroes(this.selected.getDate(), 2),
			addLeadZeroes(this.selected.getMonth() + 1, 2),
			addLeadZeroes(this.selected.getFullYear(), 4)
		].join('.');
		$(this.view.input).set('value', val);
	},

	switchLayout: function(modifier, date) {
		var newIdx = this.layoutIdx + modifier;
		if (newIdx >= this.layouts.length || newIdx < 0) {
			return this;
		}
		this.layoutIdx = newIdx;
		this.layouts[this.layoutIdx]
			.prepare()
			.renderDate(date)
		;
		return this;
	},

	setSelected: function(date) {
		this.selected = date;
		this.updateInput();
	},

	getSelected: function() {
		return this.selected;
	},

	getToday: function() {
		return this.today;
	},

	date: function(value) {
		var inDate;
		if (typeof(value) === 'undefined') {
			return this.selected;
		}
		if (!(inDate = this.toDate(value))) {
			return this;
		}
		this.selected = inDate;
		this.switchLayout(-1 * this.layoutIdx, inDate);
		return this;
	},

	toDate: function(value) {
		var date = null;
		if (typeof(value) === 'string') {
			date = new Date(value);
			if (isNaN(date.getDate())) {
				console.log('Warn: Calendar.toDate() Invalid Date value = ' + value);
				return null;
			}
		} else if (typeof(value) === 'object') {
			date = value;
		} else {
			return null;
		}
		return date;
	},

	initialize: function(elem, options) {
		options = options || {};
		this.fake = 2;
		this.elem = document.id(elem);
		this.view = {};
		this.initWrapper();
		this.today = new Date();
		if (!options.layouts) {
			options.layouts = [DayLayout, MonthLayout, YearLayout];
		}
		this.layouts = [];
		//push layouts and
		//find layout, which can render date
		for (var i = 0; i < options.layouts.length; i++) {
			this.layouts.push(new options.layouts[i](
				this.view.data,
				this.view.menu,
				this.switchLayout.bind(this),
				this.setSelected.bind(this),
				this.getSelected.bind(this),
				this.getToday.bind(this)
			));
		}
		this.layoutIdx = options.layoutIdx || 0;
		this.layouts[this.layoutIdx]
			.prepare()
			.renderDate(this.today)
		;
	},

	initWrapper: function() {
		var $calendar = this;
		this.view = {
			mainWrapper: new Element('div', {
				'class': 'calendar-wrapper'
			}),
			inputWrapper: new Element('div', {
				'class': 'calendar-input'
			}),
			input: new Element('input', {
				'class': 'calendar-input',
				events: {
					click: this.inputClick.bind($calendar)
				}
			}),
			searchBtn: new Element('div', {
				'class': 'calendar-search-btn',
				events: {
					click: this.searchClick.bind($calendar)
				}
			}),
			main: new Element('div', {
				'class': 'calendar-main'
			}),
			menu: new Element('div', {
				'class': 'calendar-selector'
			}),
			prevBtn: new Element('div', {
				'class': 'calendar-prev-btn',
				html: '<'
			}),
			info: new Element('div', {
				'class': 'calendar-info'
			}),
			nextBtn: new Element('div', {
				'class': 'calendar-next-btn',
				html: '>'
			}),
			data: new Element('div', {
				'class': 'calendar-data'
			}),
			hideBtn: new Element('div', {
				'class': 'calendar-hide-btn',
				html: 'Скрыть',
				events: {
					click: this.hideClick.bind($calendar)
				}
			})
		}
		this.view.inputWrapper.grab(this.view.input);
		this.view.inputWrapper.grab(this.view.searchBtn);

		this.view.menu.grab(this.view.prevBtn);
		this.view.menu.grab(this.view.info);
		this.view.menu.grab(this.view.nextBtn);

		this.view.main.grab(this.view.menu);
		this.view.main.grab(this.view.data);
		this.view.main.grab(this.view.hideBtn);

		this.view.mainWrapper.grab(this.view.inputWrapper);
		this.view.mainWrapper.grab(this.view.main);

		this.elem.grab(this.view.mainWrapper);
		return this;
	}
});

var Layout = new Class({
	initialize: function(elem, menu, switcher, setSelected, getSelected, getToday) {
		this.itemPerRow = 1;
		this.itemPerCol = 1;
		//layout switcher
		this.switcher = switcher;
		this.setSelected = setSelected;
		this.getSelected = getSelected;
		this.getToday = getToday;
		this.view = {elem: elem, menu: menu};
		this.monthNames = [
			'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
			'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
		];
	},

	clearItem: function(item) {
		item
			.removeClass('calendar-data-cell-enabled')
			.removeClass('calendar-data-cell-today')
			.removeClass('calendar-data-cell-disabled')
			.removeClass('calendar-data-cell-selected')
			.removeClass('calendar-data-cell-weekend')
			.removeClass('calendar-data-cell-month')
			.removeEvents();
		return item;
	},

	prepare: function() {
		this.view.menu.getElement('.calendar-prev-btn')
			.removeEvents()
			.addEvent('click', this.prevClick.bind(this))
		;
		this.view.menu.getElement('.calendar-info')
			.removeEvents()
			.addEvent('click', this.infoClick.bind(this))
		;
		this.view.menu.getElement('.calendar-next-btn')
			.removeEvents()
			.addEvent('click', this.nextClick.bind(this))
		;
		if (this.itemPerCol * this.itemPerRow === 0) {
			return this;
		}
		var viewSize = this.view.elem.getSize(),
			itemSize = {
				x: viewSize.x / this.itemPerRow - 1,
				y: viewSize.x / this.itemPerRow - 1
			},
			table = new Element('table', {
				'class': 'calendar-data-table'
			}),
			tbody = new Element('tbody')
		;
		table.grab(tbody);
		this.view.elem.empty();
		this.view.items = [];
		for (var y = 0; y < this.itemPerCol; y++) {
			var row = new Element('tr');
			tbody.grab(row);
			this.view.items.push([]);
			for (var x = 0; x < this.itemPerRow; x++) {
				var item = new Element('td', {
					'class': 'calendar-data-cell',
					styles: {
						width: itemSize.x,
						height: itemSize.y
					}
				});
				this.view.items[y][x] = item;
				row.grab(item);
			}
		}
		this.view.elem.grab(table);
		return this;
	},

	eq: function(a, b, format) {
		var result = true;
		if (a === undefined || b === undefined) {
			return false;
		}
		for (var i = 0; i < format.length; i++) {
			switch (format[i]) {
				case 'd':
					result &= a.getDate() === b.getDate();
					break;
				case 'm':
					result &= a.getMonth() === b.getMonth();
					break;
				case 'y':
					result &= a.getFullYear() === b.getFullYear();
					break;
				default:
					console.log('Warn: Layout.eq() unknown format: ', format[i]);
					return false;
			}
		}
		return result;
	},

	prevClick: function() {
		console.log('prev click');
	},

	nextClick: function() {
		console.log('next click');
	},

	infoClick: function() {
		this.switcher(1, this.date);
	},

	renderDate: function(date) {
		console.log('Warn: Layout.renderDate() This layout can not render date');
	}
});

var DayLayout = new Class({
	Extends: Layout,

	initialize: function(elem, menu, switcher, setSelected, getSelected, getToday) {
		this.parent(elem, menu, switcher, setSelected, getSelected, getToday);
		this.itemPerRow = 7;
		this.itemPerCol = 7;
		this.daysNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
	},

	russianizeDay: function(day) {
		if (day == 0) {
			day = 7;
		}
		return day - 1;
	},

	infoClick: function() {
		this.switcher(1, this.date);
	},

	renderDate: function(date) {
		this.date = new Date(date);
		//setup headers
		for (var x = 0; x < this.itemPerRow; x++) {
			this.view.items[0][x]
				.set('text', this.daysNames[x])
				.addClass('calendar-data-cell-title')
			;
		}
		//find start
		var it = new Date();
		it.setDate(1);
		it.setMonth(date.getMonth())
		it.setFullYear(date.getFullYear());
		while (this.russianizeDay(it.getDay()) !== 0) {
			it.setDate(it.getDate() - 1);
		}

		var items = this.view.items,
			selected = this.getSelected(),
			today = this.getToday(),
			$layout = this
		;
		//item click callback
		var itemClick = function() {
			var date = $(this).retrieve('date');
			$layout.date = date;
			$layout.setSelected(date);
			$layout.renderDate(date);
		}

		for (var y = 1; y < this.itemPerCol; y++) {
			for (var x = 0; x < this.itemPerRow; x++) {
				this.clearItem(items[y][x])
					.set('text', it.getDate())
					.store('x', x)
					.store('y', y)
					.store('date', new Date(it))
					.addClass(it.getMonth() === date.getMonth() ? 'calendar-data-cell-enabled' : 'calendar-data-cell-disabled')
					.addEvent('click', itemClick)
				;
				if (this.eq(selected, it, 'dmy')) {
					items[y][x].addClass('calendar-data-cell-selected');
				}
				if (this.eq(today, it, 'dmy')) {
					items[y][x].addClass('calendar-data-cell-today');
				}
				if (x > 4) {
					items[y][x].addClass('calendar-data-cell-weekend');
				}
				it.setDate(it.getDate() + 1);
			}
		}
		var caption = this.monthNames[date.getMonth()] + ' ' + date.getFullYear();
		this.view.menu.getElement('.calendar-info').set('text', caption);
	},

	nextClick: function() {
		this.date.setMonth(this.date.getMonth() + 1);
		this.renderDate(this.date);
	},

	prevClick: function() {
		this.date.setMonth(this.date.getMonth() - 1);
		this.renderDate(this.date);
	}
});

var MonthLayout = new Class({
	Extends: Layout,

	initialize: function(elem, menu, switcher, setSelected, getSelected, getToday) {
		this.parent(elem, menu, switcher, setSelected, getSelected, getToday);
		this.itemPerRow = 4;
		this.itemPerCol = 3;
	},

	renderDate: function(date) {
		var it = new Date();
		it.setDate(1);
		it.setMonth(0)
		it.setFullYear(date.getFullYear());
		this.date = new Date(it);

		var items = this.view.items,
			selected = this.getSelected(),
			today = this.getToday(),
			$layout = this
		;
		//item click callback
		var itemClick = function() {
			var date = $(this).retrieve('date');
			$layout.date = date;
			$layout.switcher(-1, date);
		}

		for (var y = 0; y < this.itemPerCol; y++) {
			for (var x = 0; x < this.itemPerRow; x++) {
				this.clearItem(items[y][x])
					.set('text', this.monthNames[it.getMonth()])
					.store('x', x)
					.store('y', y)
					.store('date', new Date(it))
					.addClass('calendar-data-cell-enabled')
					.addClass('calendar-data-cell-month')
					.addEvent('click', itemClick)
				;
				if (this.eq(selected, it, 'my')) {
					items[y][x].addClass('calendar-data-cell-selected');
				}
				if (this.eq(today, it, 'my')) {
					items[y][x].addClass('calendar-data-cell-today');
				}
				it.setMonth(it.getMonth() + 1);
			}
		}
		var caption = date.getFullYear();
		this.view.menu.getElement('.calendar-info').set('text', caption);
	},

	nextClick: function() {
		this.date.setFullYear(this.date.getFullYear() + 1);
		this.renderDate(this.date);
	},

	prevClick: function() {
		this.date.setFullYear(this.date.getFullYear() - 1);
		this.renderDate(this.date);
	}
});

var YearLayout = new Class({
	Extends: Layout,

	initialize: function(elem, menu, switcher, setSelected, getSelected, getToday) {
		this.parent(elem, menu, switcher, setSelected, getSelected, getToday);
		this.itemPerRow = 5;
		this.itemPerCol = 4;
	},

	renderDate: function(date) {
		var it = new Date();
		it.setDate(1);
		it.setMonth(0)
		it.setFullYear(date.getFullYear());
		this.date = new Date(it);

		var items = this.view.items,
			selected = this.getSelected(),
			today = this.getToday(),
			$layout = this
		;
		//item click callback
		var itemClick = function() {
			var date = $(this).retrieve('date');
			$layout.date = date;
			$layout.switcher(-1, date);
		}

		for (var y = 0; y < this.itemPerCol; y++) {
			for (var x = 0; x < this.itemPerRow; x++) {
				this.clearItem(items[y][x])
					.set('text', it.getFullYear())
					.store('x', x)
					.store('y', y)
					.store('date', new Date(it))
					.addClass('calendar-data-cell-enabled')
					.addClass('calendar-data-cell-month')
					.addEvent('click', itemClick)
				;
				if (this.eq(selected, it, 'y')) {
					items[y][x].addClass('calendar-data-cell-selected');
				}
				if (this.eq(today, it, 'y')) {
					items[y][x].addClass('calendar-data-cell-today');
				}
				it.setFullYear(it.getFullYear() + 1);
			}
		}
		var caption = date.getFullYear() + ' - ' + (it.getFullYear() - 1);
		this.view.menu.getElement('.calendar-info').set('text', caption);
	},

	nextClick: function() {
		this.date.setFullYear(this.date.getFullYear() + this.itemPerRow * this.itemPerCol);
		this.renderDate(this.date);
	},

	prevClick: function() {
		this.date.setFullYear(this.date.getFullYear() - this.itemPerRow * this.itemPerCol);
		this.renderDate(this.date);
	}
});