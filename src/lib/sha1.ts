import {readFileSync, existsSync} from "fs";
import {createHash} from "crypto";
export function sha1HashFile(file) {
	if (!existsSync(file)) {
		throw new Error('no package tarball: ' + file);
	}
	const content: Buffer = readFileSync(file);
	
	return createHash('sha1').update(content).digest('hex').toLowerCase();
}
