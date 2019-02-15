import * as vscode from 'vscode';
import Gtags from './core/gtags';
import Configuration from './configuration';

export default class StatusBar extends Gtags {
    private command?: string;
    private baritem: vscode.StatusBarItem;

    constructor(config: Configuration, command?: string, alignment?: vscode.StatusBarAlignment, priority?: number) {
        super(config);
        let baritem = vscode.window.createStatusBarItem(alignment, priority);
        baritem.text = '$(database) Synchronize';
        baritem.tooltip = 'Tagmgr: Synchronize entries';
        baritem.command = command;
        baritem.show();
        this.command = command;
        this.baritem = baritem;
    }

    public dispose() {
        this.baritem.dispose();
    }

    public sync(fpath?: string | boolean) {
        let bartext: string, promise: Promise<any>;
        if (!fpath) {
            bartext = '$(database) Synchronizing dirty entries $(sync)';
            promise = this.updateTags();
        } else if (typeof fpath === 'string') {
            bartext = `$(database) Synchronizing ${fpath} $(sync)`;
            promise = this.updateTag(fpath);
        } else {
            bartext = '$(database) Synchronizing all entries $(sync)';
            promise = this.buildTags();
        }
        return new Promise((resolve: () => void, reject: (err: Error) => void) => {
            this.baritem.command = undefined;
            this.baritem.text = bartext;
            promise.then(() => {
                this.baritem.text = '$(database) synchronization succeeded $(check)';
                this.baritem.command = this.command;
                resolve();
            }).catch((err: Error) => {
                this.baritem.text = '$(database) synchronization failed $(remove-close)';
                this.baritem.command = this.command;
                reject(err);
            });
        });
    }
}