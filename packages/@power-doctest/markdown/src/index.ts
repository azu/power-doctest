import { PowerDoctestRunnerOptions, run as runJavaScript } from "@power-doctest/javascript";
import { DocTestController } from "./DocTestController";

const allSettled = require("promise.allsettled");

type UnistParentNode = import("unist").Parent
// unist-util-parents
type UnistNode = import("unist").Node & {
    parent: UnistParentNode
};

export interface AggregateError {
    message: string;
    errors: Error[]
}

const remark = require("remark")();
const select = require("unist-util-select");
const attachParents = require("unist-util-parents");
const findAllBetween = require("unist-util-find-all-between");
const findBefore = require("unist-util-find-before");
const getComments = (parentNode: UnistParentNode, codeNode: UnistNode) => {
    const nonHtmlNode = findBefore(parentNode, codeNode, (node: UnistNode) => {
        return node.type !== "html";
    });
    const startNode = nonHtmlNode ? nonHtmlNode : parentNode.children[0];
    const htmlNodes = findAllBetween(parentNode, startNode, codeNode, "html");
    return htmlNodes.map((htmlNode: any) => {
        return htmlNode.value.replace(/^<!--/, "").replace(/-->$/, "");
    });
};


type Rejected = { status: "rejected", reason: Error };
type Fulfilled = { status: "fulfilled", value: any };
/**
 * Run code with power-doctest and return a Promise object.
 * If all is ok, resolve the promise.
 * If someone has an error, reject the promise with AggregateError
 * @param markdown
 * @param [options]
 * @returns Promise<void> or Promise<AggregateError>
 */
export const run = async (markdown: string, options: PowerDoctestRunnerOptions = {}): Promise<void> => {
    const markdownAST = attachParents(remark.parse(markdown));
    const codeBlocks = [].concat(
        select.selectAll(`code[lang="js"]`, markdownAST),
        select.selectAll(`code[lang="javascript"]`, markdownAST)
    );
    // try to eval
    const promises = codeBlocks.map(async (codeBlock: UnistNode) => {
        return runCodeBlockNode(codeBlock, options);
    });
    const isRejected = (promise: Fulfilled | Rejected): promise is Rejected => {
        return promise.status === "rejected";
    };
    // return all errors by default
    const errors = await allSettled(promises).then((promises: (Fulfilled | Rejected)[]) => {
        return promises.filter(isRejected).map((rejected: Rejected) => {
            return rejected.reason;
        });
    });
    if (errors.length === 0) {
        return; // pass
    } else {
        // return AggregateError
        return Promise.reject({
            message: `Throw ${errors.length} error in ${codeBlocks.length} code blocks`,
            errors
        });
    }
};
/**
 * Run a code of CodeBlockNode that is unist node.
 * It required a UnistNode that is parsed by marked
 * @param codeBlock
 * @param options
 */
export const runCodeBlockNode = async (codeBlock: UnistNode, options: PowerDoctestRunnerOptions = {}) => {
    const codeValue = codeBlock.value;
    if (typeof codeValue !== "string") {
        return;
    }
    const comments = getComments(codeBlock.parent, codeBlock);
    const docTestController = new DocTestController(comments);
    // <!-- doctest:disale -->
    if (docTestController.isDisabled) {
        return;
    }
    const inlineOptions = docTestController.doctestOptions;
    return runJavaScript(codeValue, {
        ...options,
        ...inlineOptions
    }).catch(error => {
        // <!-- doctest:SyntaxError -->
        if (docTestController.isExpectedError(error)) {
            return Promise.resolve();
        }
        // <!-- doctest:metadata:{...} -->
        const metadata = docTestController.doctestMetadata;
        if (codeBlock.position) {
            error.fileName = options.filePath ? options.filePath : error.fileName;
            error.lineNumber = codeBlock.position.start.line;
            error.columnNumber = codeBlock.position.start.column;
        }
        if (metadata) {
            error.meta = metadata;
        }
        return Promise.reject(error);
    });
};
