import {spawn} from "child_process";
export class NpmRunner {
	private npmCommand: string[] = [];
	static globalArgs: string[] = [];
	
	constructor(npmCommand: string[], private cwd: string) {
		if (npmCommand[0] === 'npm') {
			npmCommand.shift();
		}
		this.npmCommand = npmCommand;
	}
	
	private spawn(args: string[]): Promise<string> {
		console.error('run npm: \n\tcmd= %s\n\targs= %s\n\tcwd= %s', this.npmCommand, args, this.cwd);
		console.error('this may take long time.');
		const r = spawn('npm', [...NpmRunner.globalArgs, ...this.npmCommand, ...args], {
			cwd: this.cwd,
			env: Object.assign({}, process.env, {LANG: 'C'}),
			stdio: ['ignore', 'pipe', 'pipe'],
		});
		let out: string = '';
		let err: string = '';
		r.stdout.on('data', function (buff: Buffer) {
			out += buff.toString();
		});
		r.stderr.on('data', function (buff: Buffer) {
			err += buff.toString();
		});
		r.stdout.pipe(process.stdout);
		r.stderr.pipe(process.stderr);
		
		return new Promise((resolve, reject) => {
			const wrappedCallback = (err, data) => err? reject(err) : resolve(data);
			
			r.on('close', function (status) {
				if (status === 0) {
					resolve(out);
				} else {
					if (/no such package/.test(err)) {
						reject(new Error('no such package'));
					}
					
					console.error(err);
					reject(new Error('npm run failed unknown error.'));
				}
			});
		});
	}
	
	private async json(args: string[]): Promise<any> {
		const output = await this.spawn(args);
		
		let ret;
		try {
			eval(`ret = ${output};`);
		} catch (e) {
			throw e;
		}
		return ret;
	}
	
	private async text(args: string[]): Promise<string> {
		return await this.spawn(args);
	}
	
	view(...args: string[]) {
		return this.json(['view', ...args]);
	}
	
	pack() {
		return this.text(['pack']);
	}
	
	install(name: string) {
		return this.text(['install', name]);
	}
}

export function setGlobalParams(args: string[]) {
	NpmRunner.globalArgs = args;
}
