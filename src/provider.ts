import * as vscode from 'vscode';
import Configuration from './configuration';
import Global, { Entry } from './core/global';

export default class Provider extends Global {
    constructor(config: Configuration) {
        super(config);
    }

    protected getLocation(entry: Entry) {
        return new vscode.Location(vscode.Uri.file(entry.path), new vscode.Range(
            new vscode.Position(entry.addr.spos.row, entry.addr.spos.col),
            new vscode.Position(entry.addr.epos.row, entry.addr.epos.col)
        ));
    }

    protected getCompletionItem(line: string) {
        return new vscode.CompletionItem(line);
    }

    protected getSymbolInformation(entry: Entry) {
        return new vscode.SymbolInformation(entry.name, vscode.SymbolKind.Variable, '', this.getLocation(entry));
    }
}