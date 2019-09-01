import { parse } from "../src";

describe("asciidoctor", function() {
    it("should parse", () => {
        const doc = parse(`.app.rb 
[#src-listing] 
[source,ruby, doctest=true]  
---- 
require 'sinatra'

get '/hi' do
  "Hello World!"
end
include:a.md
----`);
        console.log(doc.getBlocks()
            .filter((block: any) => {
                const attributes = block.getAttributes();
                console.log(attributes);
                return attributes.style === "source" && attributes.language === "ruby"
            })
            .map((block: any) => {
                return block.getSource()
            }));

    });
});
