import "source-map-support/register";
import {readPackage, replacePackage} from "./lib/package.json";
import {NpmRunner} from "./lib/npm-runner";
import {inc as increseVersion, prerelease, major, minor, patch} from "semver";
import {resolve} from "path";
import {mkdirSync, existsSync} from "fs";
import {sync as rmdirSync} from "rimraf";
import {sha1HashFile} from "./lib/sha1";

export {setGlobalParams} from "./lib/npm-runner";

export async function generateRemoteVersion(packagePath: string) {
	const {name, version: localVersion, path} = readPackage(packagePath);
	
	const npmCommand = ['npm'];
	// '--registry' xxxxx
	const npm = new NpmRunner(npmCommand, path);
	
	const testingDir = '/tmp/mnpv';
	try {
		if (existsSync(testingDir)) {
			rmdirSync(testingDir);
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
		rmdirSync(testingDir);
	}
	
	let remoteVersion, remoteHash;
	try {
		const remote = await npm.view(name);
		remoteHash = remote.dist.shasum;
		remoteVersion = remote.version;
		console.log('there is remote package.\n\tversion=%s\n\tshasum=%s', remoteVersion, remoteHash);
	} catch (e) {
		if (e.message === 'no such package') {
			console.log('there is no remote package. set local version: %s', localVersion);
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
	console.log('version compare:\n\tlocal  =%s\n\tremote =%s', localVersion, remoteVersion);
	if (remoteVersion === localVersion || baseVersion(remoteVersion) === baseVersion(localVersion)) {
		const packageName = await npm.pack();
		await sleep(1);
		const packageLocation = resolve(path, packageName.trim());
		const localHash = sha1HashFile(packageLocation);
		
		console.log('hash compare:\n\tlocal  =%s\n\tremote =%s', localHash, remoteHash);
		if (localHash !== remoteHash) {
			changed = true;
			createdVersion = remoteVersion;
		}
	} else {
		changed = true; // base version change.
		createdVersion = baseVersion(localVersion);
	}
	
	if (!changed) {
		console.log('same version');
		return '';
	}
	
	if (!prerelease(createdVersion)) {
		createdVersion += '-0';
	}
	
	const newVersion = increseVersion(createdVersion, 'prerelease');
	console.log('generated remote version is: %s', newVersion);
	return newVersion;
}

export async function generateRemoteVersionAndSave(packagePath: string) {
	const newVersion = await generateRemoteVersion(packagePath);
	
	if (newVersion) {
		replacePackage(packagePath, newVersion);
		return true;
	}
	
	return false;
}

function baseVersion(vString) {
	return `${major(vString)}.${minor(vString)}.${patch(vString)}`;
}
function sleep(sec) {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, sec * 1000);
	});
}
