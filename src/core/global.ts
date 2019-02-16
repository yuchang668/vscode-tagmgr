import * as fs from 'fs';
import { promisify } from 'util';
import Executable from './executable';
import Configuration from '../configuration';

const fsp = {
    stat: promisify<string, fs.Stats>(fs.stat)
};

export type Entry = { name: string, path: string, info: string, addr: { spos: { row: number, col: number }, epos: { row: number, col: number } } };

export enum Format {
    PATH = 'path',
    GREP = 'grep',
    CTAGS = 'ctags',
    CXREF = 'ctags-x',
    CSCOPE = 'cscope'
}

export default class Global extends Executable {
    private dbpath: string;

    constructor(config: Configuration) {
        let cmdargs = ['--quiet'];
        let cmd = config.getGlobalPath();
        let conf = config.getGtagsConf();
        let label = config.getGtagsLabel();
        let encode = config.getTermEncode();
        if (config.getIgnoreCase()) {
            cmdargs.push('--ignore-case');
        }
        if (conf) {
            cmdargs.push('--gtagsconf', conf);
        }
        if (label) {
            cmdargs.push('--gtagslabel', label);
        }
        super(cmd, cmdargs, encode);
        this.dbpath = config.getDatabasePath();
    }

    private async global(args: ReadonlyArray<string>) {
        let stat = await fsp.stat(this.dbpath);
        if (!stat.isDirectory()) {
            throw new Error('Not found dbpath');
        }
        let { stdout, stderr } = await this.exec(args, this.dbpath);
        return { stdout: stdout.trim().split(/\r?\n/), stderr: stderr.trim().split(/\r?\n/) };
    }

    private async findtags(args: ReadonlyArray<string> = []) {
        let result: Entry[] = [];
        let { stdout } = await this.global(['--encode-path', '" "', '--absolute', '--cxref'].concat(args));
        for (let line of stdout) {
            let temp = line.match(/^([^\s]+)\s+(\d+)\s([^\s]+)\s(.*)$/);
            if (temp) {
                let name = temp[1];
                let addr = parseInt(temp[2]) - 1;
                let path = temp[3];
                let info = temp[4];
                let col = info.indexOf(name);
                result.push({
                    name: name,
                    info: info,
                    path: path.replace(/%20/g, ' '),
                    addr: {
                        spos: { row: addr, col: col },
                        epos: { row: addr, col: col + name.length }
                    }
                });
            }
        }
        return result;
    }

    public async getpaths(pattn?: string) {
        let args = ['--path'];
        if (pattn) {
            args.push(pattn);
        }
        let { stdout } = await this.global(args);
        return stdout;
    }

    public async dumptags(fpath: string | ReadonlyArray<string>, fmt: Format = Format.PATH) {
        let args = ['--file', '--result', fmt];
        if (typeof fpath === 'string') {
            args.push('--file-list');
        }
        let { stdout } = await this.global(args.concat(fpath));
        return stdout.sort((a, b) => {
            a = a.toUpperCase();
            b = b.toUpperCase();
            return a === b ? 0 : a < b ? -1 : 1;
        });
    }

    public async fixtags(symbol: string) {
        let { stdout } = await this.global(['--through', '--completion', symbol]);
        return stdout;
    }

    public async deftags(symbol: string) {
        return await this.findtags(['--through', '--definition', symbol]);
    }

    public async reftags(symbol: string) {
        return await this.findtags(['--reference', symbol]);
    }

    public async doctags(fpath: string) {
        return await this.findtags(['--file', fpath]);
    }
}