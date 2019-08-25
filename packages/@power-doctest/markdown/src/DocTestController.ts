// MIT © 2017 azu
"use strict";

const DISABLE_PATTERN = /doctest:\s*?disable/;
const DOCTEST_OPTIONS = /doctest:\w*?options:({[^}]+})/;
const DOCTEST_METADATA = /doctest:\w*?meta:({[^}]+})/;
const ERROR_TYPE_PATTERN = /doctest:\s*([\w\s]*?Error)/;

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
    private _expectedErrorName: undefined | (null | string);

    /**
     * @param {string[]} comments
     */
    constructor(comments: string[]) {
        this.comments = comments;
        this._expectedErrorName = this._getExpectedErrorName(comments);
    }

    /**
     * Return true if `this.comments` include DISABLE_PATTERN
     * @returns {boolean}
     */
    get isDisabled() {
        return this.comments.some(comment => {
            return DISABLE_PATTERN.test(comment);
        });
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
    _getExpectedErrorName(comments: string[]) {
        const expectedErrorTypeComment = comments.find(comment => {
            return ERROR_TYPE_PATTERN.test(comment);
        });
        if (!expectedErrorTypeComment) {
            return;
        }
        const match = expectedErrorTypeComment.match(ERROR_TYPE_PATTERN);
        return match && match[1];
    }
}
