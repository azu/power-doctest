const Asciidoctor = require("asciidoctor");
const asciidoctor = Asciidoctor();

export function parse(code: string) {
    const doc = asciidoctor.load(code);
    return doc;
}
