// MIT © 2017 azu
"use strict";
// Support doctest:xxx and doctest-xxx
// doctest:xxx is back compatible syntax.
const DISABLE_PATTERN = /doctest[:-]\s*?disable(:?d)?/;
const ENABLE_PATTERN = /doctest[:-]\s*?enable(:?d)?/;
const DOCTEST_OPTIONS = /doctest[:-]\w*?options:({[^}]+})/;
const DOCTEST_METADATA = /doctest[:-]\w*?meta:({[^}]+})/;
// doctest-error:SyntaxError
const ERROR_TYPE_PATTERN = /(?:doctest|doctest-error):\s*([\w\s]*?Error)/;

/**
 * CodeBlockの手前に該当するHTMLコメントはdoctestの制御コードとして扱える
 *
 * @example
 * 以下のは実行されないのでOKになる
 *
 * <!-- doctest:disable -->
 * ```js
 * 1; // => 2
 * ```
 *
 * @example
 * 次はdoctestの結果のError名を指定できる
 *
 * <!-- doctest: ReferenceError -->
 * ```js
 * NO_DEFINE++;
 * ```
 *
 * @type {String}
 */
export class DocTestController {
    private comments: string[];
    private _expectedErrorName: undefined | string;

    /**
     * @param {string[]} comments
     */
    constructor(comments: string[]) {
        this.comments = comments;
        this._expectedErrorName = this._getExpectedErrorName(comments);
    }

    /**
     * Return state of @power-doctest/types
     */
    get state() {
        for (const comment of this.comments) {
            if (ENABLE_PATTERN.test(comment)) {
                return "enabled";
            } else if (DISABLE_PATTERN.test(comment)) {
                return "disabled";
            }
        }
        // not defined
        return "none";
    }

    /**
     * @returns {string|undefined}
     */
    get expectedErrorName() {
        return this._expectedErrorName;
    }

    /**
     * @returns {boolean}
     */
    get hasExpectedError() {
        return this.expectedErrorName !== undefined;
    }

    get doctestMetadata() {
        const optionComment = this.comments.find(comment => {
            return DOCTEST_METADATA.test(comment);
        });
        if (!optionComment) {
            return;
        }
        const optionString = optionComment.match(DOCTEST_METADATA);
        if (!optionString) {
            return;
        }
        try {
            return JSON.parse(optionString[1]);
        } catch (error) {
            throw new Error(`Can not parsed the metadata.

doctest:metadata:{ ... } should be json string.

Actual: ${optionString}
`);
        }
    }

    get doctestOptions() {
        const optionComment = this.comments.find(comment => {
            return DOCTEST_OPTIONS.test(comment);
        });
        if (!optionComment) {
            return;
        }
        const optionString = optionComment.match(DOCTEST_OPTIONS);
        if (!optionString) {
            return;
        }
        try {
            return JSON.parse(optionString[1]);
        } catch (error) {
            throw new Error(`Can not parsed the options.

doctest:options:{ ... } should be json string.

Actual: ${optionString}
`);
        }
    }

    /**
     * Return true, if the `error` is expected error name
     * If not defined expected error, return true.
     * @param {Error} [error]
     * @returns {boolean}
     */
    isExpectedError(error: Error) {
        if (!this.hasExpectedError) {
            return false;
        }
        const expectedErrorType = this.expectedErrorName;
        if (!expectedErrorType) {
            return true; // no expected error
        }
        return error.name === expectedErrorType;
    }

    /**
     * Return expected Error name if expected is defined.
     * @returns {string[]}
     * @returns {string|undefined}
     * @private
     */
    _getExpectedErrorName(comments: string[]): string | undefined {
        const expectedErrorTypeComment = comments.find(comment => {
            return ERROR_TYPE_PATTERN.test(comment);
        });
        if (!expectedErrorTypeComment) {
            return;
        }
        const match = expectedErrorTypeComment.match(ERROR_TYPE_PATTERN);
        const matched = match && match[1];
        return matched ? matched : undefined;
    }
}
