import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

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
    
    // FIX: Added proper error handling
    try {
        const content = fs.readFileSync(commentsPath, 'utf-8');
        const parsed = JSON.parse(content);
        return parsed.comments || {};
    } catch (err) {
        // No companion file or invalid JSON - return empty
        return {};
    }
}

function getJsonPathAtPosition(document: vscode.TextDocument, position: vscode.Position): string {
    const text = document.getText();
    const lines = text.split('\n');
    const currentLine = lines[position.line];
    
    // Find the key at this position
    const keyMatch = currentLine.match(/"([^"]+)"\s*:/);
    if (keyMatch) {
        return keyMatch[1];
    }
    
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

    // FIX: Wrapped in try-catch
    try {
        const comments = await loadCompanionComments(document.uri.fsPath);
        const comment = comments[jsonPath];
        
        if (comment) {
            return new vscode.Hover(new vscode.MarkdownString(comment));
        }
    } catch (err) {
        console.error('Error loading comments:', err);
    }
    
    return undefined;
}

async function provideJsonCodeLenses(document: vscode.TextDocument): Promise<vscode.CodeLens[]> {
    // FIX: Added try-catch
    let comments: Record<string, string> = {};
    try {
        comments = await loadCompanionComments(document.uri.fsPath);
    } catch (err) {
        console.log('No comments file found or error loading:', err);
    }
    
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
