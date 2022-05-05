class PrivateExampleClass {
    #privateField = 42;
    dump() {
        console.log(this.#privateField); // => 42
    }
}
const privateExample = new PrivateExampleClass();
privateExample.dump();
