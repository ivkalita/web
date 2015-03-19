var STATUS_UNKNOWN = {
		text: 'Результаты не известны',
		css: 'result-unknown'
	},
    STATUS_FAILED  = {
    	text: 'Тест не пройден!',
    	css: 'result-failed'
    },
    STATUS_SUCCESS = {
    	text: 'Тест пройден',
    	css: 'result-success'
    }
;

var jsBeautify = require('js-beautify').js_beautify,
	sortBundle = require('./sort.js'),
	mergeSort = sortBundle.mergeSort,
	RESULT_EQUAL = sortBundle.RESULT_EQUAL,
	RESULT_GREATER = sortBundle.RESULT_GREATER,
	RESULT_LESS = sortBundle.RESULT_LESS
;	
	

function Test(id, test, etalon, comparator) {
	defaultComparator = function(a, b) {
		return a === b ? RESULT_EQUAL : a > b ? RESULT_GREATER : RESULT_LESS; 
	};

	defaultEtalon = function(arr) {
		var status = STATUS_SUCCESS;
		for (var i = 1; i < arr.length; i++) {
			if (this.comparator(arr[i], arr[i - 1]) === RESULT_GREATER) {
				status = STATUS_FAILED;
				break;
			}
		}
		return status;
	};

	this.id = id;
	this.test = test;
	this.etalon = etalon;
	this.comparator = typeof(comparator) === 'function' ? comparator : defaultComparator;
	this.etalon = typeof(etalon) === 'undefined' || etalon === null ? defaultEtalon : etalon;
	this.lastResult = {
		status: STATUS_UNKNOWN,
		time: 0,
		out: null
	};
	this.view = this.renderView();
	this.refreshView();
}

Test.prototype.defaultComparator = function(a, b) {
	return a === b ? RESULT_EQUAL : a > b ? RESULT_GREATER : RESULT_LESS; 
};

Test.prototype.defaultEtalon = function(arr) {
	var status = STATUS_SUCCESS;
	for (var i = 1; i < arr.length; i++) {
		if (this.comparator(arr[i], arr[i - 1]) === RESULT_GREATER) {
			status = STATUS_FAILED;
			break;
		}
	}
	return status;
};

Test.prototype.objectComparator = function(a, b) {
	return a.key === b.key ? RESULT_EQUAL : a.key > b.key ? RESULT_GREATER : RESULT_LESS;
}

Test.prototype.make = function() {
	var start = window.performance.now();;
	$test = this;
	mergeSort(this.comparator, this.test, 0, this.test.length - 1, function(err, result) {
		var end = window.performance.now();;
		out = {
			time: end - start,
			result: result
		};
		var status = STATUS_SUCCESS;
		if (typeof($test.etalon) === 'function') {
			status = $test.etalon(out);
		} else if ($test.etalon.length !== out.result.length) {
			status = STATUS_FAILED;
		} else {
			for (var i = 0; i < $test.etalon.length; i++) {
				if ($test.comparator($test.etalon[i], out.result[i]) === RESULT_EQUAL) {
					continue;
				}
				status = STATUS_FAILED;
				break;
			}
		}
		$test.lastResult = {
			status: status,
			time: out.time,
			out: out.result
		};
		$test.refreshView();
	});	
}

Test.prototype.checkSize = function(arr) {
	if (arr.hasOwnProperty('length')) {
		if (arr.length > 50) {
			return 'Возможно, вам не важно, что здесь написано';
		}
		return arr;
	}
	return arr;
}

Test.prototype.renderDescription = function(num) {
	var wrapper = $('<div></div>').toggleClass('test-info');
	var title = $('<h1></h1>').text('Тест № ' + (num + 1));
	var testData = $('<div></div>')
		.toggleClass('data-info')
		.append(
			$('<h2></h2>').text('Входные данные:')
		)
		.append(
			$('<pre></pre>').text(
				jsBeautify(JSON.stringify(this.checkSize(this.test)), {indent_size: 2})
			)
		)
	;
	if (typeof(this.etalon) === 'function') {
		testData
			.append(
				$('<h2></h2>').text('Проверяющая функция:')
			)
			.append(
				$('<pre></pre>').text(
					jsBeautify(this.etalon.toString(), {indent_size: 2})
				)
			)
		;
	}
	else if (typeof(this.etalon) !== 'undefined') {
		testData
			.append(
				$('<h2></h2>').text('Эталонные данные:')
			)
			.append(
				$('<pre></pre>').text(
					jsBeautify(JSON.stringify(this.checkSize(this.etalon)), {indent_size: 2})
				)
			)
		;
	}
	testData
		.append(
			$('<h2></h2>').text('Компаратор:')
		)
		.append(
			$('<pre></pre>').text(
				jsBeautify(this.comparator.toString(), {indent_size: 2})
			)
		)
		.append(
			$('<h2></h2>').text('Результат:')
		)
		.append(
			$('<h3></h3>').text('Состояние:')
		)
		.append(
			$('<p></p>').text(this.lastResult.status.text)
		);
	if (this.lastResult.status !== STATUS_UNKNOWN) {
		testData
			.append(
				$('<h3></h3>').text('Выходные данные:')
			)
			.append(
				$('<pre></pre>').text(
					jsBeautify(JSON.stringify(this.checkSize(this.lastResult.out)), {indent_size: 2})
				)
			)
			.append(
				$('<h3></h3>').text('Время работы: ' + this.lastResult.time)
			)
		;
	}
	wrapper.append(title);
	wrapper.append(testData);
	wrapper.find('pre').each(function(i, block) {
		hljs.highlightBlock(block);
	})
	return wrapper;
}

Test.prototype.renderView = function() {
	var testCell = $('<td></td>')
		.toggleClass('test-cell')
		.text('Тест № ' + (this.id + 1))
		.attr('data-id', this.id)
	;

	var $test = this;
	var resultCell = $('<td></td>');

	var row = $('<tr></tr>')
		.append(testCell)
		.append(resultCell);

	return {
		row: row,
		testCell: testCell,
		resultCell: resultCell
	}
}

Test.prototype.refreshView = function() {
	this.view.resultCell
		.removeClass()
		.addClass(this.lastResult.status.css)
		.text(this.lastResult.status.text)
	;
}

Test.prototype.click = function(func) {
	this.view.testCell.click(func);
}

module.exports = {
	Test: Test,
	tests: [
		new Test(0, [4, 1, 2, 6], [1, 2, 4, 6]),
		new Test(1, ['b', 'd', 'a', 'c', 'e'], ['a', 'b', 'c', 'd', 'e']),
		new Test(2, [4, 1, 2, 6])
	]
};