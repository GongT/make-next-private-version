import {readFileSync} from "fs";
import {createHash} from "crypto";
export function sha1HashFile(file) {
	const content: Buffer = readFileSync(file);
	
	return createHash('sha1').update(content).digest('hex').toLowerCase();
}
