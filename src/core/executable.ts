import { decode } from 'iconv-lite';
import { spawn, ChildProcess } from 'child_process';

export default class Executable {
    private cmd: string;
    private args: ReadonlyArray<string>;
    private encode: string;
    private subprocess?: ChildProcess;

    constructor(cmd: string, args: ReadonlyArray<string> = [], encode: string = 'utf-8') {
        this.cmd = cmd;
        this.args = args;
        this.encode = encode;
    }

    protected exec(args: ReadonlyArray<string>, cwd?: string, env?: NodeJS.ProcessEnv) {
        return new Promise((resolve: (out: { stdout: string, stderr: string }) => void, reject: (err: Error) => void) => {
            let stdout: Buffer[] = [], stderr: Buffer[] = [];
            this.subprocess = spawn(this.cmd, this.args.concat(args), { cwd, env });
            this.subprocess.stdout.on('data', (data: Buffer) => stdout.push(data));
            this.subprocess.stderr.on('data', (data: Buffer) => stderr.push(data));
            this.subprocess.on('exit', (code: number, signal: string) => {
                delete this.subprocess;
                if (code) {
                    reject(new Error(`Exit code: ${code}`));
                } else if (signal) {
                    reject(new Error(`Terminate signal: ${signal}`));
                } else {
                    resolve({ stdout: decode(Buffer.concat(stdout), this.encode), stderr: decode(Buffer.concat(stderr), this.encode) });
                }
            });
        });
    }

    protected send(msg: any) {
        return !!this.subprocess && this.subprocess.send(msg);
    }

    protected kill() {
        if (this.subprocess) {
            this.subprocess.kill();
        }
    }
}
