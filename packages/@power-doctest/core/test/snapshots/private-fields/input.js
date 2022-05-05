class PrivateExampleClass {
    #privateField = 42;
    dump() {
        console.log(this.#privateField); // => 42
    }
}
