#!/usr/bin/env node
import { toAssertFromSource } from "../lib/comment-to-assert.js";
import concat from "concat-stream";
import fs from "fs";
import path from "path";

const file = process.argv[2];
const input = file && file !== "-" ? fs.createReadStream(process.argv[2]) : process.stdin;
input.pipe(
    concat(function (buf) {
        const filePath = path.join(process.cwd(), file);
        console.log(toAssertFromSource(buf.toString("utf8"), filePath));
    })
);
