#!/usr/bin/env node
/// <reference path="../globals.d.ts" />

import {generateRemoteVersion, generateRemoteVersionAndSave} from "./index";

const save = process.argv.indexOf('--save') > 0 || process.argv.indexOf('-s') > 0;
if (save) {
	if (process.argv.indexOf('--save') > 0) {
		process.argv.splice(process.argv.indexOf('--save'), 1);
	} else {
		process.argv.splice(process.argv.indexOf('-s'), 1);
	}
}

if (process.argv.length > 2) {
	if (save) {
		generateRemoteVersionAndSave(process.argv[2]);
	} else {
		console.log(generateRemoteVersion(process.argv[2]));
	}
}
