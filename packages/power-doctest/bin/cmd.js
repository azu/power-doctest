#!/usr/bin/env node

import { run } from "../lib/cli.js";

run()
	.then((result) => {
		console.log(result);
	})
	.catch((error) => {
		console.error(error.message);
		process.exit(1);
	});
