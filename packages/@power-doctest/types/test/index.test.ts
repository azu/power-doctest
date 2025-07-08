import type { ParsedCode, ParsedResults, ParserArgs } from "../src";

it("is valid types", () => {
	const parse = (args: ParserArgs): ParsedResults => {
		const code: ParsedCode = {
			code: args.content,
			state: "none",
			location: {
				start: {
					line: 1,
					column: 0,
				},
				end: {
					line: 1,
					column: 0,
				},
			},
		};
		return [code];
	};
	parse({
		content: "test",
		filePath: "test.md",
	});
});
