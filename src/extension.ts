import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// BUG: Forgot to import the util functions - this will work but they're unused
// import { parseJsonPath } from './util';

export function activate(context: vscode.ExtensionContext) {
    console.log('JSON Comments Companion activated');

    const hoverProvider = vscode.languages.registerHoverProvider('json', {
        provideHover(document, position) {
            return provideJsonHover(document, position);
        }
    });

    const codeLensProvider = vscode.languages.registerCodeLensProvider('json', {
        provideCodeLenses(document) {
            return provideJsonCodeLenses(document);
        }
    });

    context.subscriptions.push(hoverProvider, codeLensProvider);
}

async function loadCompanionComments(jsonPath: string): Promise<Record<string, string>> {
    const dir = path.dirname(jsonPath);
    const baseName = path.basename(jsonPath, '.json');
    const commentsPath = path.join(dir, `${baseName}.comments.json`);
    
    // BUG: Not handling file-not-found error - will throw if no companion file
    const content = fs.readFileSync(commentsPath, 'utf-8');
    const parsed = JSON.parse(content);
    
    return parsed.comments || {};
}

function getJsonPathAtPosition(document: vscode.TextDocument, position: vscode.Position): string {
    const text = document.getText();
    const lines = text.split('\n');
    const currentLine = lines[position.line];
    
    // Naive parsing - find the key at this position
    const keyMatch = currentLine.match(/"([^"]+)"\s*:/);
    if (keyMatch) {
        return keyMatch[1];
    }
    
    // BUG: Returns empty string - should try smarter parsing
    return '';
}

async function provideJsonHover(
    document: vscode.TextDocument,
    position: vscode.Position
): Promise<vscode.Hover | undefined> {
    
    const jsonPath = getJsonPathAtPosition(document, position);
    if (!jsonPath) {
        return undefined;
    }

    // BUG: No try-catch here - could crash on missing file
    const comments = await loadCompanionComments(document.uri.fsPath);
    const comment = comments[jsonPath];
    
    if (comment) {
        return new vscode.Hover(new vscode.MarkdownString(comment));
    }
    
    return undefined;
}

async function provideJsonCodeLenses(document: vscode.TextDocument): Promise<vscode.CodeLens[]> {
    // BUG: Should catch errors here
    const comments = await loadCompanionComments(document.uri.fsPath);
    const codeLenses: vscode.CodeLens[] = [];
    
    const text = document.getText();
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(/^\s*"([^"]+)"\s*:/);
        
        if (match) {
            const key = match[1];
            const comment = comments[key];
            
            if (comment) {
                const range = new vscode.Range(i, 0, i, line.length);
                const codeLens = new vscode.CodeLens(range, {
                    title: `💬 ${comment.substring(0, 40)}${comment.length > 40 ? '...' : ''}`,
                    command: '',
                    arguments: []
                });
                codeLenses.push(codeLens);
            }
        }
    }
    
    return codeLenses;
}

export function deactivate() {
    console.log('JSON Comments Companion deactivated');
}
