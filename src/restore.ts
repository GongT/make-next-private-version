#!/usr/bin/env node
import {restorePackage} from "./lib/package.json";

const args = process.argv.slice(2);
const packagPath = args.pop();
if (!packagPath) {
	throw new Error('require a param');
}

restorePackage(packagPath);
