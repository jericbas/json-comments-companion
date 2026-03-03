import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

const CONFIG_HOVER = 'jsonCommentsCompanion.hoverEnabled';
const CONFIG_CODELENS = 'jsonCommentsCompanion.codeLensEnabled';

let hoverProvider: vscode.Disposable | undefined;
let codeLensProvider: vscode.Disposable | undefined;

export function activate(context: vscode.ExtensionContext) {
    console.log('JSON Comments Companion activated');

    // Initial registration
    updateProviders(context);

    // Listen for config changes
    const configChangeListener = vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('jsonCommentsCompanion')) {
            updateProviders(context);
        }
    });

    // Commands
    const openComments = vscode.commands.registerCommand('jsonCommentsCompanion.openCommentsFile', openCommentsFile);
    const toggleHover = vscode.commands.registerCommand('jsonCommentsCompanion.toggleHover', async () => toggleSetting(CONFIG_HOVER));
    const toggleCodeLens = vscode.commands.registerCommand('jsonCommentsCompanion.toggleCodeLens', async () => toggleSetting(CONFIG_CODELENS));

    context.subscriptions.push(openComments, toggleHover, toggleCodeLens, configChangeListener);
}

function updateProviders(context: vscode.ExtensionContext): void {
    const config = vscode.workspace.getConfiguration();
    const hoverEnabled = config.get(CONFIG_HOVER, true);
    const codeLensEnabled = config.get(CONFIG_CODELENS, true);

    // Re-register hover
    if (hoverProvider) hoverProvider.dispose();
    if (hoverEnabled) {
        hoverProvider = vscode.languages.registerHoverProvider('json', {
            provideHover(document, position) { return provideHover(document, position); }
        });
        context.subscriptions.push(hoverProvider);
    }

    // Re-register CodeLens
    if (codeLensProvider) codeLensProvider.dispose();
    if (codeLensEnabled) {
        codeLensProvider = vscode.languages.registerCodeLensProvider('json', {
            provideCodeLenses(document) { return provideCodeLenses(document); }
        });
        context.subscriptions.push(codeLensProvider);
    }
}

async function toggleSetting(key: string): Promise<void> {
    const config = vscode.workspace.getConfiguration();
    const current = config.get(key, true);
    const setting = key === CONFIG_HOVER ? 'hover comments' : 'CodeLens comments';
    await config.update(key, !current, true);
    vscode.window.showInformationMessage(`JSON ${setting} ${!current ? '✅ enabled' : '❌ disabled'}`);
}

async function openCommentsFile(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const jsonPath = editor.document.uri.fsPath;
    const dir = path.dirname(jsonPath);
    const baseName = path.basename(jsonPath, '.json');
    const commentsPath = path.join(dir, `${baseName}.comments.json`);

    if (fs.existsSync(commentsPath)) {
        const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(commentsPath));
        vscode.window.showTextDocument(doc);
    } else {
        const answer = await vscode.window.showInformationMessage(
            `Create "${path.basename(commentsPath)}"?`, 'Yes', 'No'
        );
        if (answer === 'Yes') {
            fs.writeFileSync(commentsPath, JSON.stringify({ comments: {} }, null, 2));
            const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(commentsPath));
            vscode.window.showTextDocument(doc);
        }
    }
}

async function loadComments(jsonPath: string): Promise<Record<string, string>> {
    const dir = path.dirname(jsonPath);
    const baseName = path.basename(jsonPath, '.json');
    const commentsPath = path.join(dir, `${baseName}.comments.json`);
    try {
        const content = fs.readFileSync(commentsPath, 'utf-8');
        return JSON.parse(content).comments || {};
    } catch {
        return {};
    }
}

async function provideHover(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.Hover | undefined> {
    const line = document.lineAt(position.line).text;
    const match = line.match(/"([^"]+)"\s*:/);
    if (!match) return undefined;

    const comments = await loadComments(document.uri.fsPath);
    if (comments[match[1]]) {
        return new vscode.Hover(new vscode.MarkdownString(comments[match[1]]));
    }
    return undefined;
}

async function provideCodeLenses(document: vscode.TextDocument): Promise<vscode.CodeLens[]> {
    const config = vscode.workspace.getConfiguration();
    const maxLen = config.get('jsonCommentsCompanion.maxCommentLength', 50);
    const comments = await loadComments(document.uri.fsPath);
    const lenses: vscode.CodeLens[] = [];

    for (let i = 0; i < document.lineCount; i++) {
        const line = document.lineAt(i).text;
        const match = line.match(/^\s*"([^"]+)"\s*:/);
        if (match && comments[match[1]]) {
            const text = comments[match[1]].length > maxLen 
                ? comments[match[1]].slice(0, maxLen) + '...'
                : comments[match[1]];
            lenses.push(new vscode.CodeLens(
                new vscode.Range(i, 0, i, line.length),
                { title: '💬 ' + text, command: 'jsonCommentsCompanion.openCommentsFile', arguments: [] }
            ));
        }
    }
    return lenses;
}

export function deactivate() {}
