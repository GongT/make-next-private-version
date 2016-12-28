/// <reference path="../globals.d.ts" />

import "@gongt/jenv-data/global";
import "source-map-support/register";
import {readPackage, replacePackage} from "./lib/package.json";
import {NpmRunner} from "./lib/npm-runner";
import {inc as increseVersion, prerelease, major, minor, patch} from "semver";
import {resolve} from "path";
import {mkdirSync, existsSync} from "fs";
import {sync} from "rimraf";
import {sha1HashFile} from "./lib/sha1";

export {setGlobalParams} from "./lib/npm-runner";

export async function generateRemoteVersion(packagePath: string) {
	const {name, version: localVersion, path} = readPackage(packagePath);
	
	const npmConfig = JsonEnv.gfw.npmRegistry;
	
	const npmCommand = ['npm', '--registry', npmConfig.url];
	const npm = new NpmRunner(npmCommand, path);
	
	const testingDir = '/tmp/mnpv';
	try {
		if (existsSync(testingDir)) {
			sync(testingDir);
			mkdirSync(testingDir);
		} else {
			mkdirSync(testingDir);
		}
		// const npmInst = new NpmRunner(npmCommand, testingDir);
		// const text = await npmInst.install(name);
		// console.log(text);
	} catch (e) {
		console.log(e);
	} finally {
		sync(testingDir);
	}
	
	let remoteVersion, remoteHash;
	try {
		const remote = await npm.view(name);
		remoteHash = remote.dist.shasum;
		remoteVersion = remote.version;
	} catch (e) {
		if (e.message === 'no such package') {
			remoteVersion = localVersion;
			remoteHash = '';
			if (!localVersion) {
				throw new Error('target package.json file do not have version field');
			}
		} else {
			throw e;
		}
	}
	
	let changed = false, createdVersion;
	console.error('version compare:\n\tlocal  =%s\n\tremote =%s', localVersion, remoteVersion);
	if (remoteVersion === localVersion || baseVersion(remoteVersion) === baseVersion(localVersion)) {
		const packageName = await npm.pack();
		const packageLocation = resolve(path, packageName);
		const localHash = sha1HashFile(packageLocation);
		
		console.error('hash compare:\n\tlocal  =%s\n\tremote =%s', localHash, remoteHash);
		if (localHash !== remoteHash) {
			changed = true;
			createdVersion = remoteVersion;
		}
	} else {
		changed = true; // base version change.
		createdVersion = baseVersion(localVersion);
	}
	
	if (!changed) {
		console.error('same version');
		return '';
	}
	
	if (!prerelease(createdVersion)) {
		createdVersion += '-0';
	}
	
	const newVersion = increseVersion(createdVersion, 'prerelease');
	console.error('generated remote version is: %s', newVersion);
	return newVersion;
}

export async function generateRemoteVersionAndSave(packagePath: string) {
	const {version: oldVersion} = readPackage(packagePath);
	const newVersion = await generateRemoteVersion(packagePath);
	
	if (newVersion) {
		replacePackage(packagePath, newVersion);
		process.exit(0);
	} else {
		process.exit(100);
	}
}

function baseVersion(vString) {
	return `${major(vString)}.${minor(vString)}.${patch(vString)}`;
}
