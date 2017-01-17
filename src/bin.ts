#!/usr/bin/env node
/// <reference path="../globals.d.ts" />
import {generateRemoteVersionAndSave} from "./index";
import {setGlobalParams} from "./lib/npm-runner";

const args = process.argv.slice(2);
const packagPath = args.pop();
if (!packagPath) {
	throw new Error('require a param');
}

setGlobalParams(args);
generateRemoteVersionAndSave(packagPath).then((changed) => {
	if (changed) {
		console.log('generated new package version !');
		process.exit(0);
	} else {
		console.log('use old package version !');
		process.exit(100);
	}
}).catch((e) => {
	console.error(e.message);
	process.exit(1);
});
