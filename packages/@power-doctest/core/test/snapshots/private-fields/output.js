var assert = require("power-assert");
class PrivateExampleClass {
	#privateField = 42;
	dump() {
		assert.strictEqual(this.#privateField, 42); // => 42
	}
}
