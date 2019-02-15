import * as vscode from 'vscode';
import Provider from './provider';
import Configuration from './configuration';

export default class CompletionItemProvider extends Provider implements vscode.CompletionItemProvider {
    constructor(config: Configuration) {
        super(config);
    }

    public async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
        let symbol = document.getText(document.getWordRangeAtPosition(position));
        let lines = await this.fixtags(symbol);
        let result: vscode.CompletionItem[] = [];
        for (let line of lines) {
            result.push(this.getCompletionItem(line));
        }
        return result;
    }
}