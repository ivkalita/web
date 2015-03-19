function testCellClick() {
	var id = $(this).data('id');
	$.colorbox({
		transition: "none",
		width: "70%",
		opacity: "0.85",
		html: tests[id].renderDescription.bind(tests[id], id),
		closeButton: false
	});
	console.log('test-cell.click, id = ' + id);	
}

$(function() {
	var tbody = $('#tests-table tbody');
	for (var i = 0; i < tests.length; i++) {
		tbody.append(tests[i].view.row);
		tests[i].click(testCellClick);
	}

	$('#btn-test-all').click(function() {
		for (var i = 0; i < tests.length; i++) {
			tests[i].make();
		}
	});

	$('button.btn-gen').click(function() {
		var len = parseInt($('#test-length-input').val())
			cnt = parseInt($('#test-cnt-input').val()),
			type = parseInt($('#test-type-select').val()),
			id = tests.length,
			comparator = undefined,
			etalon = undefined
		;
		if (cnt == 0 || len == 0) {
			return;
		}
		if (type == TEST_TYPE_OBJECT) {
			comparator = Test.prototype.objectComparator;
		}
		for (var i = 0; i < cnt; i++) {
			tests.push(
				new Test(id + i, Generator.genArray(len, type), etalon, comparator)
			);
			tbody.append(tests[id + i].view.row);
			tests[id + i].click(testCellClick);
		}
	});
});