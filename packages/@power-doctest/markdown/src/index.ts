import type { ParsedResults, ParserArgs } from "@power-doctest/types";
import { remark } from "remark";
import findAllBetween from "unist-util-find-all-between";
import { findBefore } from "unist-util-find-before";
import { parents as attachParents } from "unist-util-parents";
import { selectAll } from "unist-util-select";
import { DocTestController } from "./DocTestController.js";

type UnistParentNode = import("unist").Parent;
// unist-util-parents
type UnistNode = import("unist").Node & {
	parent: UnistParentNode;
};

const processor = remark();
const getComments = (parentNode: UnistParentNode, codeNode: UnistNode) => {
	const nonHtmlNode = findBefore(parentNode, codeNode, (node: any) => {
		return node.type !== "html";
	});
	const startNode = nonHtmlNode ? nonHtmlNode : parentNode.children[0];
	const htmlNodes = findAllBetween(parentNode, startNode, codeNode, "html");
	return htmlNodes.map((htmlNode: any) => {
		return htmlNode.value.replace(/^<!--/, "").replace(/-->$/, "");
	});
};

/**
 * Parse Markdown code and return ParseResult object.
 */
export const parse = ({ content, filePath }: ParserArgs): ParsedResults => {
	const markdownAST = attachParents(processor.parse(content));
	const codeBlocks = [
		...selectAll(`code[lang="js"]`, markdownAST),
		...selectAll(`code[lang="javascript"]`, markdownAST),
	];
	return codeBlocks.map((codeBlock: any) => {
		const codeValue: string = codeBlock.value || "";
		const comments = getComments(codeBlock.parent, codeBlock);
		const docTestController = new DocTestController(comments);
		const state = docTestController.state;
		const doctestOptions = docTestController.doctestOptions;
		const expectedError = docTestController.expectedErrorName;
		const metadata = docTestController.doctestMetadata;
		return {
			code: codeValue,
			location: codeBlock.position
				? {
						start: {
							line: codeBlock.position.start.line,
							column: codeBlock.position.start.column,
						},
						end: {
							line: codeBlock.position.end.line,
							column: codeBlock.position.end.column,
						},
					}
				: {
						start: {
							line: 1,
							column: 0,
						},
						end: {
							line: 1,
							column: 0,
						},
					},
			state: state,
			expectedError: expectedError,
			metadata: metadata,
			doctestOptions: doctestOptions
				? {
						filePath: filePath,
						...doctestOptions,
					}
				: {
						filePath,
					},
		};
	});
};
