import {resolve, dirname} from "path";
import {readFileSync, writeFileSync, existsSync} from "fs";

interface PackageJson {
	name: string;
	version: string;
}

export function readPackage(path: string) {
	if (!/\/package\.json$/.test(path)) {
		path = resolve(path, 'package.json');
	}
	
	const {name, version}:PackageJson = require(path);
	const folder = dirname(path);
	
	return {name, version, path: folder};
}

export function replacePackage(path: string, newVersion: string) {
	if (!/\/package\.json$/.test(path)) {
		path = resolve(path, 'package.json');
	}
	
	let p = resolve(path, '..');
	while (p !== '/' && p !== '.') {
		if (existsSync(resolve(p, '.git'))) {
			throw new Error('there is a .git folder. refuse to run in development environment.');
		}
		p = resolve(p, '..');
	}
	
	let str: string = readFileSync(path, 'utf-8');
	
	str = str.replace(/"version"\s*:\s*".+?"/, `"version": "${newVersion}"`);
	
	return writeFileSync(path, str, 'utf-8');
}
