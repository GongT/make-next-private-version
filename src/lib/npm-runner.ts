import {spawnSync} from "child_process";
export class NpmRunner {
	private npmCommand: string[] = [];
	static globalArgs: string[] = [];
	
	constructor(npmCommand: string[], private cwd: string) {
		if (npmCommand[0] === 'npm') {
			npmCommand.shift();
		}
		this.npmCommand = npmCommand;
	}
	
	private spawn(args: string[]) {
		console.error('run npm: \n\tcmd= %s\n\targs= %s\n\tcwd= %s', this.npmCommand, args, this.cwd);
		const r = spawnSync('npm', [...NpmRunner.globalArgs, ...this.npmCommand, ...args], {
			encoding: 'utf-8',
			cwd: this.cwd,
			env: Object.assign({}, process.env, {LANG: 'C'}),
			stdio: ['ignore', 'pipe', 'pipe'],
		});
		if (r.error) {
			console.error('fail to start process');
			throw r.error;
		}
		if (r.status !== 0) {
			const stderr = r.stderr.toString();
			if (/no such package/.test(stderr)) {
				throw new Error('no such package');
			}
			
			delete r['envPairs'];
			delete r['options'];
			console.error(r.stderr);
			throw new Error('npm run failed unknown error.');
		}
		return r;
	}
	
	private json(args: string[]): any {
		const r = this.spawn(args);
		const out = r.stdout.toString().trim();
		
		try {
			let ret;
			eval(`ret = ${out};`);
			return ret;
		} catch (e) {
			console.error(out);
			throw e;
		}
	}
	
	private text(args: string[]): string {
		const r = this.spawn(args);
		return r.stdout.toString().trim();
	}
	
	view(...args: string[]) {
		return this.json(['view', ...args]);
	}
	
	pack() {
		return this.text(['pack']);
	}
}

export function setGlobalParams(args: string[]) {
	NpmRunner.globalArgs = args;
}
