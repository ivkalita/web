var TEST_TYPE_INT = 1,
	TEST_TYPE_FLOAT = 2,
	TEST_TYPE_STRING = 3,
	TEST_TYPE_OBJECT = 4
;

module.exports = {
	TEST_TYPE_INT: TEST_TYPE_INT,
	TEST_TYPE_FLOAT: TEST_TYPE_FLOAT,
	TEST_TYPE_STRING: TEST_TYPE_STRING,
	TEST_TYPE_OBJECT: TEST_TYPE_OBJECT,
	genIntArray: function(len) {
		var result = [];
		for (var i = 0; i < len; i++) {
			result.push(Math.floor(Math.random() * 10000));
		}
		return result;
	},

	genFloatArray: function(len) {
		var result = [];
		for (var i = 0; i < len; i++) {
			result.push(Math.random() * 10000);
		}
		return result;		
	},

	genStringArray: function(len) {
		var result = [];
		for (var i = 0; i < len; i++) {
			result.push((Math.random() * 10000).toString());
		}
		return result;
	},

	genObjectArray: function(len) {
		var result = [];
		for (var i = 0; i < len; i++) {
			result.push(
				{
					key: Math.random() * 10000,
					value: 'some test text'
				}
			);
		}
		return result;
	},

	genArray: function(len, type) {
		switch(type) {
			case TEST_TYPE_INT:
				return this.genIntArray(len);
			case TEST_TYPE_FLOAT:
				return this.genFloatArray(len);
			case TEST_TYPE_STRING:
				return this.genStringArray(len);
			case TEST_TYPE_OBJECT:
				return this.genObjectArray(len);
			default:
				throw 'Unregistered test type!';
		}
	}
}