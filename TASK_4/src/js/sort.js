var RESULT_EQUAL   = 0,
	RESULT_GREATER = 1,
	RESULT_LESS    = 2
;

var async = require('async');

function mergeSort(comparator, arr, left, right, cb) {
	if (left - right === 0) {
		cb(null, [arr[left]]);
		return;
	}
	var pivot = Math.floor((left + right) / 2);
	//left = 0 right = 2
	//pivot = 1
	//a = [0..1] b = [2..2]
	//-----------------------
	//left = 0 right = 3
	//pivot = 1
	//a = [0..1] b = [2..3]
	//-----------------------
	//left = 0 right = 1
	//pivot = 0
	//a = [0..0] b = [1..1]
	//-----------------------
	async.parallel({
			a: function(parallelCallback) {
				mergeSort(comparator, arr, left, pivot, parallelCallback);
			},
			b: function(parallelCallback) {
				mergeSort(comparator, arr, pivot + 1, right, parallelCallback);
			}
		},
		function(err, results) {
			if (err) {
				console.log('Mystery exception happened');
				console.log(err);
				throw err;
			}
			var a = results.a,
				b = results.b,
				result = [],
				i = 0,
				j = 0,
				fillRest = function(result, counter, source) {
					while(counter < source.length) {
						result.push(source[counter++]);
					}
				}
			;
			while (true) {
				if (i >= a.length) {
					fillRest(result, j, b);
					break;
				}
				if (j >= b.length) {
					fillRest(result, i, a);
					break;
				}
				if (comparator(a[i], b[j]) === RESULT_LESS) {
					result.push(a[i++]);
				} else {
					result.push(b[j++]);
				}
			}
			cb(null, result);
			return;
		}
	);
}


module.exports = {
	RESULT_EQUAL: 0,
	RESULT_GREATER: 1,
	RESULT_LESS: 2,
	mergeSort: mergeSort
};