#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import concat from "concat-stream";
import { toAssertFromSource } from "../lib/comment-to-assert.js";

const file = process.argv[2];
const input = file && file !== "-" ? fs.createReadStream(process.argv[2]) : process.stdin;
input.pipe(
	concat((buf) => {
		const filePath = path.join(process.cwd(), file);
		console.log(toAssertFromSource(buf.toString("utf8"), filePath));
	}),
);
