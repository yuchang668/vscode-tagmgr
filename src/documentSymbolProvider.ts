import * as vscode from 'vscode';
import Provider from './provider';
import Configuration from './configuration';

export default class DocumentSymbolProvider extends Provider implements vscode.DocumentSymbolProvider {
    constructor(config: Configuration) {
        super(config);
    }

    public async provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken) {
        let fpath = document.fileName;
        let entries = await this.doctags(fpath);
        let result: vscode.SymbolInformation[] = [];
        for (let entry of entries) {
            result.push(this.getSymbolInformation(entry));
        }
        return result;
    }
}