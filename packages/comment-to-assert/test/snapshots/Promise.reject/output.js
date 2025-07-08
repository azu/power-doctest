assert.rejects(Promise.reject(new Error("message"))).then(() => {}); // => Reject: "message"
