export type createWrappedAssertionCallback = (args: {
    name: string;
    args: any[];
}) => void

export const createWrappedAssertion = (assert: any, callback: createWrappedAssertionCallback): any => {
    const wrapAssert: any = {};
    const assertArg = assert as any;
    Object.keys(assert).forEach(key => {
        if (typeof assertArg[key] === "function") {
            wrapAssert[key] = (...args: any[]) => {
                callback({
                    name: key,
                    args: args
                });
                assertArg[key](...args);
            }
        } else {
            wrapAssert[key] = assertArg[key];
        }
    });
    return wrapAssert;
};
