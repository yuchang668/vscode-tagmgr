import * as vscode from 'vscode';
import Provider from './provider';
import Configuration from './configuration';

export default class ReferenceProvider extends Provider implements vscode.ReferenceProvider {
    constructor(config: Configuration) {
        super(config);
    }

    public async provideReferences(document: vscode.TextDocument, position: vscode.Position, context: vscode.ReferenceContext, token: vscode.CancellationToken) {
        let symbol = document.getText(document.getWordRangeAtPosition(position));
        let entries = await this.reftags(symbol);
        let result: vscode.Location[] = [];
        for (let entry of entries) {
            result.push(this.getLocation(entry));
        }
        return result;
    }
}