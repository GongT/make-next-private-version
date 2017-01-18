import {resolve, dirname} from "path";
import {writeFileSync, existsSync, statSync, utimesSync} from "fs";

interface PackageJson {
	name: string;
	version: string;
	backupVersion?: string;
}

export function readPackage(path: string) {
	if (!/\/package\.json$/.test(path)) {
		path = resolve(path, 'package.json');
	}
	
	const {name, version, backupVersion}:PackageJson = require(path);
	const folder = dirname(path);
	console.log('local package (%s) version is %s', name, version);
	return {
		name,
		version: backupVersion || version,
		path: folder,
	};
}
export function restorePackage(path: string) {
	if (!/\/package\.json$/.test(path)) {
		path = resolve(path, 'package.json');
	}
	
	const pkg = require(path);
	if (pkg.backupVersion) {
		console.error('restoring version field (from %s to %s) in package.json', pkg.version, pkg.backupVersion);
		pkg.version = pkg.backupVersion;
		delete pkg.backupVersion;
		
		write(path, pkg);
	}
}

export function replacePackage(path: string, newVersion: string, doNotTouch = false) {
	if (!/\/package\.json$/.test(path)) {
		path = resolve(path, 'package.json');
	}
	
	const pkg = require(path);
	const oldVersion = pkg.version;
	
	if (detectGit(path)) {
		pkg.backupVersion = pkg.backupVersion || pkg.version;
		console.error(' backup version: %s', pkg.backupVersion);
		pkg.version = newVersion;
	}
	
	console.error('updating version field (to %s) in package.json', newVersion);
	write(path, pkg, doNotTouch);
	
	return oldVersion;
}

function write(path, pkg, doNotTouch = false) {
	const out = JSON.stringify(pkg, null, 7).replace(/^( {7})+/mg, (s) => {
		return (new Array(s.length / 7)).fill('\t').join('');
	});
	if (doNotTouch) {
		const stat = statSync(path);
		writeFileSync(path, out, 'utf-8');
		utimesSync(path, stat.atime, stat.mtime);
	} else {
		writeFileSync(path, out, 'utf-8');
	}
}

function detectGit(path) {
	let p = resolve(path, '..');
	while (p !== '/' && p !== '.') {
		if (existsSync(resolve(p, '.git'))) {
			return true
		}
		p = resolve(p, '..');
	}
	return false;
}
