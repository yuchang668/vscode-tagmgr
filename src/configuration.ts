import * as path from 'path';
import * as vscode from 'vscode';

export default class Configuration {
    private getConfiguration(): vscode.WorkspaceConfiguration {
        return vscode.workspace.getConfiguration();
    }

    public getGtagsConf() {
        return this.getConfiguration().get<string>('tagmgr.path.conf', '');
    }

    public getGtagsFiles() {
        return this.getConfiguration().get<string>('tagmgr.path.files', '');
    }

    public getGtagsPath() {
        return this.getConfiguration().get<string>('tagmgr.path.gtags', 'gtags');
    }

    public getGlobalPath() {
        return this.getConfiguration().get<string>('tagmgr.path.global', 'global');
    }

    public getTermEncode() {
        return this.getConfiguration().get<string>('tagmgr.encode.term', 'utf-8');
    }

    public getGtagsLabel() {
        return this.getConfiguration().get<string>('tagmgr.param.label', 'default');
    }

    public getIgnoreCase() {
        return this.getConfiguration().get<boolean>('tagmgr.param.caseless', false);
    }

    public getProjectPath() {
        return path.normalize(vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0].uri.fsPath || '');
    }

    public getDatabasePath() {
        return path.resolve(this.getProjectPath(), this.getConfiguration().get<string>('tagmgr.path.database', '.tagmgr'));
    }
}