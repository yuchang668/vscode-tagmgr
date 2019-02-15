import * as vscode from 'vscode';
import Provider from './provider';
import Configuration from './configuration';

export default class DefinitionProvider extends Provider implements vscode.DefinitionProvider {
    constructor(config: Configuration) {
        super(config);
    }

    public async provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
        let symbol = document.getText(document.getWordRangeAtPosition(position));
        let entries = await this.deftags(symbol);
        let result: vscode.Location[] = [];
        for (let entry of entries) {
            result.push(this.getLocation(entry));
        }
        return result;
    }
}