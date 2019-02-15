import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { createHash } from 'crypto';
import Executable from './executable';
import Global, { Format } from './global';
import Configuration from '../configuration';

const fsp = {
    stat: promisify<string, fs.Stats>(fs.stat),
    rename: promisify<fs.PathLike, fs.PathLike>(fs.rename),
    mkdir: promisify<string>(fs.mkdir),
    readFile: promisify<string, Buffer>(fs.readFile),
    writeFile: promisify<string, string | Buffer, fs.WriteFileOptions>(fs.writeFile)
};

function sha256(data: string | Buffer) {
    return createHash('sha256').update(data).digest('hex');
}

export default class Gtags extends Executable {
    private rootdir: string;
    private dbpath: string;
    private global: Global;

    constructor(config: Configuration) {
        let cmdargs = ['--quiet', '--skip-unreadable'];
        let cmd = config.getGtagsPath();
        let conf = config.getGtagsConf();
        let label = config.getGtagsLabel();
        let files = config.getGtagsFiles();
        let encode = config.getTermEncode();
        if (conf) {
            cmdargs.push('--gtagsconf', conf);
        }
        if (label) {
            cmdargs.push('--gtagslabel', label);
        }
        if (files) {
            cmdargs.push('--file', files);
        }
        super(cmd, cmdargs, encode);
        this.rootdir = config.getProjectPath();
        this.dbpath = config.getDatabasePath();
        this.global = new Global(config);
    }

    private async gentags(...args: string[]) {
        let flist = args.length ? args.slice().map(fpath => path.resolve(this.dbpath, path.normalize(fpath))) : await this.global.getpaths();
        let fhash: { [propName: string]: string[] } = {};
        let gentagfile = async (name: string) => {
            let fpath = path.join(this.dbpath, name + '.path');
            let ftags = path.join(this.dbpath, name + '.tags');
            let ftemp = path.join(this.dbpath, name + '.temp');
            let flist = fhash[name];
            try {
                let stat = await fsp.stat(ftemp);
                if (stat.isFile()) { return; }
            } catch (err) { }
            if (args.length) {
                try {
                    let buf = await fsp.readFile(fpath);
                    flist = Array.from(new Set(flist.concat(buf.toString().trim().split('\r?\n'))));
                } catch (err) { }
                for (let [idx, fpath] of flist.entries()) {
                    try {
                        let stat = await fsp.stat(fpath);
                        if (!stat.isFile()) {
                            throw new Error('Not File');
                        }
                    } catch (err) {
                        flist.splice(idx, 1);
                    }
                }
            }
            await fsp.writeFile(fpath, flist.join('\n'), 'utf8');
            let tags = await this.global.dumptags(fpath, Format.CTAGS);
            tags.unshift(
                '!_TAG_FILE_FORMAT	1	/1=standard, 2=extended/',
                '!_TAG_FILE_SORTED	2	/0=unsorted, 1=sorted, 2=foldcase/',
                '!_TAG_OUTPUT_MODE	ctags	/ctags, u-ctags, e-ctags/'
            );
            await fsp.writeFile(ftemp, tags.join('\n'), 'utf8');
            await fsp.rename(ftemp, ftags);
            delete fhash[name];
        };
        for (let fpath of flist) {
            let name = sha256(fpath)[0];
            (fhash[name] = fhash[name] || []).push(fpath);
        }
        for (let name of Object.keys(fhash)) {
            await gentagfile(name);
        }
        if (Object.keys(fhash).length) {
            throw new Error('Export ctags failed');
        }
    }

    private async gtags(args: ReadonlyArray<string> = []) {
        try {
            let stat = await fsp.stat(this.dbpath);
            if (!stat.isDirectory()) {
                throw new Error('Not found dbpath');
            }
        } catch (err) {
            await fsp.mkdir(this.dbpath);
        }
        await fsp.writeFile(path.join(this.dbpath, 'GTAGSROOT'), '..', 'utf8');
        let { stdout, stderr } = await this.exec(args.concat(this.dbpath), this.rootdir);
        return { stdout: stdout.trim().split(/\r?\n/), stderr: stderr.trim().split(/\r?\n/) };
    }

    public async buildTags() {
        await this.gtags();
        await this.gentags();
    }

    public async updateTags() {
        await this.gtags(['--incremental']);
        await this.gentags();
    }

    public async updateTag(fpath: string) {
        await this.gtags(['--single-update', fpath]);
        await this.gentags(fpath);
    }
}