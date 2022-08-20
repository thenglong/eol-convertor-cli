#!/usr/bin/env node
"use strict";

import eol from "eol";
import { globby } from "globby";
import fs from "fs";
import path from "path";
import { isText } from "istextorbinary";

const argv = process.argv;
const inputFilesGlob = argv[argv.length - 1];
const isWarmup = argv[argv.length - 2] === "warmup";
const isCrlf = argv[argv.length - 2] === "crlf";

const dir = process.cwd();

console.log("Running in directory " + dir);
console.log("Files GLOB regex: " + inputFilesGlob);
console.log(
  isWarmup
    ? "WARMUP: will only list files, no action will be performed"
    : "Converting to " + (isCrlf ? "CRLF" : "LF")
);
console.log("---");

const files = await globby(inputFilesGlob, {
  nodir: true,
  // ignoreFiles: ["**/node_modules/**/*.*"],
  ignore: ["**/node_modules/*"],
  cwd: dir,
  gitignore: true,
});

if (!files || files.length === 0) {
  console.error("ERROR: no files found");
  process.exit(1);
}
files.forEach(fileName => {
  console.log(fileName);
  if (isWarmup) {
    return;
  }
  try {
    const file = fs.readFileSync(path.join(dir, fileName));
    if (!isText(null, file)) {
      console.log(`${fileName} is not text file`);
      return;
    }
    const fileContent = file.toString();
    const convertFn = (isCrlf ? eol.crlf : eol.lf).bind(eol);
    fs.writeFileSync(fileName, convertFn(fileContent));
  } catch (error) {
    console.warn(error);
  }
});
console.log("---");
