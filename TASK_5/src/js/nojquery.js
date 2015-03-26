function NoJQuery(selector) {

	this.getNamedAttribute = function(elem, value) {
		var attr = elem.attributes.getNamedItem(value);
		if (!attr) {
			attr = document.createAttribute(value);
			elem.attributes.setNamedItem(attr);
		}
		return attr;
	}


	rid = /^#([\w\W]+)$/;
	rtag = /^<([\w\W]+?)><\/\1>$/;
	if (!selector) {
		this.length = 0;
		return this;
	}
	if (selector.nodeType) {
		this.length = 1;
		this[0] = selector;
		return this;
	}
	if (typeof(selector) === 'string') {
		if (selector.charAt(0) === '<') {
			match = rtag.exec(selector);
			if (!match || !match[1]) {
				return this;
			}
			this.length = 1;
			this[0] = document.createElement(match[1]);
			return this;
		}
		if (selector.charAt(0) === '#') {
			match = rid.exec(selector);
			if (!match || !match[1]) {
				this.length = 0;
				return this;
			}
			var elem = document.getElementById(match[1]);
			if (!elem) {
				this.length = 0;
				return this;
			}
			this.length = 1;
			this[0] = elem;
			return this;
		}
		var elems = document.getElementsByTagName(selector);
		if (!elems || elems.length === 0) {
			this.length = 0;
			return this;
		}
		this.length = elems.length;
		for (var i = 0; i < elems.length; i++) {
			this[i] = elems[i];
		}
		return this;
	}
}

NoJQuery.prototype.removeChildren = function() {
	if (this.length === 0) {
		return this;
	}
	for (var i = 0; i < this.length; i++) {
		for (var j = 0; j < this[i].children.length; j++) {
			this[i].children[j].remove();
		}
	}
	return this;
}

NoJQuery.prototype.append = function(elem) {
	if (!elem instanceof NoJQuery) {
		elem = new NoJQuery(elem)
	}
	if (this.length !== 1 || elem.length !== 1) {
		return this;
	}
	this[0].appendChild(elem[0]);
	return this;
}

NoJQuery.prototype.text = function(value) {
	if ((typeof(value) === 'undefined' && this.length !== 1) || (typeof(value) !== 'undefined' && typeof(value) !== 'number' && typeof(value) !== 'string')) {
		return undefined;
	}
	if (typeof(value) === 'undefined') {
		return this[0].innerText;
	}
	for (var i = 0; i < this.length; i++) {
		this[i].innerText = value;
	}
	return this;
}

NoJQuery.prototype.attr = function(key, value) {
	if ((typeof(value) === 'undefined' && this.length !== 1) || (typeof(value) !== 'undefined' && typeof(value) !== 'number' && typeof(value) !== 'string')) {
		return undefined;
	}
	if (typeof(value) === 'undefined') {
		return this.getNamedAttribute(this[0], key).value;
	}
	for (var i = 0; i < this.length; i++) {
		this.getNamedAttribute(this[i], key).value = value;
	}
	return this;
}

NoJQuery.prototype.class = function(value) {
	return this.attr('class', value);
}

NoJQuery.prototype.hasClass = function(value) {
	if (typeof(value) !== 'string' || value.trim() === '') {
		return false;
	}
	for (var i = 0; i < this.length; i++) {
		var classAttr = this.getNamedAttribute(this[i], 'class'),
			classes = classAttr.value.split(' '),
			hasClass = classes.indexOf(value) >= 0
		;
		if (!hasClass) {
			return false;
		}
	}
	return true;

}

NoJQuery.prototype.addClass = function(value) {
	if (typeof(value) !== 'string' || value.trim() === '') {
		return this;
	}
	value = value.trim();
	for (var i = 0; i < this.length; i++) {
		var classAttr = this.getNamedAttribute(this[i], 'class'),
			classes = classAttr.value.split(' '),
			hasClass = classes.indexOf(value) >= 0
		;
		if (!hasClass) {
			classes.push(value);
			classAttr.value = classes.join(' ').trim();
		}
	}
	return this;
}

NoJQuery.prototype.removeClass = function(value) {
	if (typeof(value) !== 'string' || value.trim() === '') {
		return this;
	}
	value = value.trim();
	for (var i = 0; i < this.length; i ++) {
		var classAttr = this.getNamedAttribute(this[i], 'class'),
			classes = classAttr.value.split(' '),
			idx = classes.indexOf(value)
		;
		if (idx >= 0) {
			classes = classes.slice(0, idx).concat(classes.slice(idx + 1, classes.length));
			classAttr.value = classes.join(' ').trim();
		}
	}
	return this;
}

NoJQuery.prototype.toggleClass = function(value) {
	if (typeof(value) !== 'string' || value.trim() === '') {
		return this;
	}
	value = value.trim();  
	for (var i = 0; i < this.length; i++) {
		var classAttr = this.getNamedAttribute(this[i], 'class'),
			classes = classAttr.value.split(' '),
			idx = classes.indexOf(value)
		;
		if (idx < 0) {
			classes.push(value);
		} else {
			classes = classes.slice(0, idx).concat(classes.slice(idx + 1, classes.length));
		}
		classAttr.value = classes.join(' ').trim();
	}
	return this;
}

NoJQuery.prototype.data = function(key, value) {
	if (typeof(value) === 'undefined' && this.length !== 1) {
		return undefined;
	}
	if (typeof(value) === 'undefined') {
		if (typeof(this[0]._data) === 'undefined') {
			return undefined;
		}
		return this[0]._data.key;
	}
	for (var i = 0; i < this.length; i++) {
		if (typeof(this[i]._data) === 'undefined') {
			this[i]._data = {};
		}
		this[i]._data.key = value;
	}
	return this;
}

NoJQuery.prototype.click = function(func) {
	for (var i = 0; i < this.length; i++) {
		this[i].onclick = func;
	}
	return this;
}

NoJQuery.prototype.width = function(value) {
	if ((typeof(value) === 'undefined' && this.length !== 1) || (typeof(value) !== 'undefined' && typeof(value) !== 'number')) {
		return undefined;
	}
	if (typeof(value) === 'undefined') {
		return this[0].offsetWidth;
	}
	for (var i = 0; i < this.length; i++) {
		this[i].style['width'] = value + 'px';
	}
	return this;
}

NoJQuery.prototype.height = function(value) {
	if ((typeof(value) === 'undefined' && this.length !== 1) || (typeof(value) !== 'undefined' && typeof(value) !== 'number')) {
		return undefined;
	}
	if (typeof(value) === 'undefined') {
		return this[0].offsetHeight;
	}
	for (var i = 0; i < this.length; i++) {
		this[i].style['height'] = value + 'px';
	}
	return this;
}

module.exports = function factory(selector) {
	return new NoJQuery(selector);
}