#!/usr/bin/env node

require("../lib/cli").run().then((result) => {
    console.log(result);
}).catch(error => {
    console.error(error.message);
    process.exit(1);
});
