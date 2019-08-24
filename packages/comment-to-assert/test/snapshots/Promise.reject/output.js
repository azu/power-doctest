assert.rejects(Promise.reject(new Error("message"))); // => Reject: "message"
