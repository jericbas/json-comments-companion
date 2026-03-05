import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { buildJsonPath } from './util';
import { loadCommentsCached, createCommentsFileWatcher, clearAllCaches } from './watcher';
import { AddCommentQuickFixProvider, addCommentForKey } from './quickFix';

const CONFIG_HOVER = 'jsonCommentsCompanion.hoverEnabled';
const CONFIG_CODELENS = 'jsonCommentsCompanion.codeLensEnabled';

let hoverProvider: vscode.Disposable | undefined;
let codeLensProvider: vscode.Disposable | undefined;

/**
 * Represents a key position in a JSON file with its full path
 */
interface KeyPosition {
    line: number;
    key: string;
    fullPath: string;
    valueStart: number;
}

export function activate(context: vscode.ExtensionContext): void {
    console.log('JSON Comments Companion activated');

    updateProviders(context);

    const configChangeListener = vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('jsonCommentsCompanion')) {
            updateProviders(context);
        }
    });

    const openComments = vscode.commands.registerCommand(
        'jsonCommentsCompanion.openCommentsFile',
        openCommentsFile
    );
    const toggleHover = vscode.commands.registerCommand(
        'jsonCommentsCompanion.toggleHover',
        () => toggleSetting(CONFIG_HOVER)
    );
    const toggleCodeLens = vscode.commands.registerCommand(
        'jsonCommentsCompanion.toggleCodeLens',
        () => toggleSetting(CONFIG_CODELENS)
    );
    const addComment = vscode.commands.registerCommand(
        'jsonCommentsCompanion.addCommentForKey',
        (uri, keyPath, keyName) => addCommentForKey(uri, keyPath, keyName)
    );
    const quickFixProvider = vscode.languages.registerCodeActionsProvider(
        'json',
        new AddCommentQuickFixProvider(),
        { providedCodeActionKinds: AddCommentQuickFixProvider.providedCodeActionKinds }
    );

    context.subscriptions.push(
        openComments,
        toggleHover,
        toggleCodeLens,
        addComment,
        quickFixProvider,
        configChangeListener
    );
}

function updateProviders(context: vscode.ExtensionContext): void {
    const config = vscode.workspace.getConfiguration();
    const hoverEnabled = config.get(CONFIG_HOVER, true);
    const codeLensEnabled = config.get(CONFIG_CODELENS, true);

    if (hoverProvider) {
        hoverProvider.dispose();
        hoverProvider = undefined;
    }

    if (hoverEnabled) {
        hoverProvider = vscode.languages.registerHoverProvider('json', {
            provideHover: async (document, position) => provideHover(document, position)
        });
        context.subscriptions.push(hoverProvider);
    }

    if (codeLensProvider) {
        codeLensProvider.dispose();
        codeLensProvider = undefined;
    }

    if (codeLensEnabled) {
        codeLensProvider = vscode.languages.registerCodeLensProvider('json', {
            provideCodeLenses: async (document) => provideCodeLenses(document)
        });
        context.subscriptions.push(codeLensProvider);
    }
}

async function toggleSetting(key: string): Promise<void> {
    const config = vscode.workspace.getConfiguration();
    const current = config.get(key, true);
    const setting = key === CONFIG_HOVER ? 'hover comments' : 'CodeLens comments';

    try {
        await config.update(key, !current, true);
        vscode.window.showInformationMessage(`JSON ${setting} ${!current ? '✅ enabled' : '❌ disabled'}`);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to toggle setting: ${error}`);
    }
}

async function openCommentsFile(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('No active JSON file');
        return;
    }

    const jsonPath = editor.document.uri.fsPath;
    const commentsPath = getCommentsPath(jsonPath);

    if (!commentsPath) {
        vscode.window.showErrorMessage('Unable to determine comments file path');
        return;
    }

    try {
        if (fs.existsSync(commentsPath)) {
            const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(commentsPath));
            await vscode.window.showTextDocument(doc);
        } else {
            const baseName = path.basename(commentsPath);
            const answer = await vscode.window.showInformationMessage(
                `Create "${baseName}"?`,
                'Yes',
                'No'
            );

            if (answer === 'Yes') {
                const dir = path.dirname(commentsPath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }

                const keys = extractKeyPositions(editor.document).map(k => k.fullPath);
                const comments: Record<string, string> = {};
                for (const key of keys.slice(0, 30)) {
                    comments[key] = '';
                }

                fs.writeFileSync(commentsPath, JSON.stringify({ comments }, null, 2));
                const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(commentsPath));
                await vscode.window.showTextDocument(doc);
                vscode.window.showInformationMessage(`Created ${baseName}`);
            }
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Error opening comments file: ${error}`);
    }
}

function getCommentsPath(jsonPath: string): string | null {
    const config = vscode.workspace.getConfiguration('jsonCommentsCompanion');
    const pattern = config.get<string>('filePattern', '{filename}.comments.json');

    const dir = path.dirname(jsonPath);
    const baseName = path.basename(jsonPath, '.json');
    const commentsFileName = pattern.replace('{filename}', baseName);

    return path.join(dir, commentsFileName);
}

async function loadComments(jsonPath: string): Promise<Record<string, string>> {
    const commentsPath = getCommentsPath(jsonPath);
    if (!commentsPath) return {};

    try {
        const content = fs.readFileSync(commentsPath, 'utf-8');
        const parsed = JSON.parse(content) as { comments?: Record<string, string> };
        return parsed.comments || {};
    } catch {
        return {};
    }
}

async function provideHover(
    document: vscode.TextDocument,
    position: vscode.Position
): Promise<vscode.Hover | undefined> {
    try {
        const keyPositions = extractKeyPositions(document);
        const keyAtPosition = keyPositions.find(k => k.line === position.line);

        if (!keyAtPosition) return undefined;

        const comments = await loadCommentsCached(document.uri.fsPath);
        const comment = findCommentForPath(comments, keyAtPosition.fullPath);

        if (comment) {
            return new vscode.Hover(new vscode.MarkdownString(comment));
        }

        return undefined;
    } catch (error) {
        console.error('Error in provideHover:', error);
        return undefined;
    }
}

async function provideCodeLenses(
    document: vscode.TextDocument
): Promise<vscode.CodeLens[]> {
    const lenses: vscode.CodeLens[] = [];

    try {
        const config = vscode.workspace.getConfiguration();
        const maxLen = config.get('jsonCommentsCompanion.maxCommentLength', 50);
        const comments = await loadCommentsCached(document.uri.fsPath);
        const keyPositions = extractKeyPositions(document);

        for (const keyPos of keyPositions) {
            const comment = findCommentForPath(comments, keyPos.fullPath);
            if (comment) {
                const text = comment.length > maxLen
                    ? comment.slice(0, maxLen) + '...'
                    : comment;
                const line = document.lineAt(keyPos.line);
                lenses.push(new vscode.CodeLens(
                    new vscode.Range(keyPos.line, 0, keyPos.line, line.text.length),
                    {
                        title: '💬 ' + text,
                        command: 'jsonCommentsCompanion.openCommentsFile',
                        arguments: []
                    }
                ));
            }
        }

        return lenses;
    } catch (error) {
        console.error('Error in provideCodeLenses:', error);
        return [];
    }
}

/**
 * Extracts all key positions with their full paths from a JSON document.
 * Handles nested objects and arrays.
 */
function extractKeyPositions(document: vscode.TextDocument): KeyPosition[] {
    const positions: KeyPosition[] = [];
    const text = document.getText();
    const lines = text.split('\n');

    const stack: string[] = [];
    let inString = false;
    let stringStart = 0;
    let escaped = false;
    let currentKey: string | null = null;
    let braceDepth = 0;
    let bracketDepth = 0;
    let arrayIndex = 0;

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
        const line = lines[lineNum];

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (escaped) {
                escaped = false;
                continue;
            }

            if (char === '\\') {
                escaped = true;
                continue;
            }

            if (char === '"' && !inString) {
                inString = true;
                stringStart = i + 1;
            } else if (char === '"' && inString) {
                inString = false;
                const key = line.slice(stringStart, i);

                // Look ahead for colon (indicates this is a key, not a value)
                const rest = line.slice(i + 1);
                if (/^\s*:/.test(rest)) {
                    currentKey = key;

                    // Build full path
                    if (bracketDepth > 0) {
                        // Inside array - use index
                        positions.push({
                            line: lineNum,
                            key: currentKey,
                            fullPath: buildJsonPath(currentKey, buildJsonPath(String(arrayIndex), stack.join('.'))),
                            valueStart: i + 1
                        });
                    } else {
                        positions.push({
                            line: lineNum,
                            key: currentKey,
                            fullPath: stack.length > 0 ? buildJsonPath(currentKey, stack.join('.')) : currentKey,
                            valueStart: i + 1
                        });
                    }
                }
            } else if (!inString) {
                if (char === '{') {
                    if (currentKey) {
                        stack.push(currentKey);
                        currentKey = null;
                    }
                    braceDepth++;
                    arrayIndex = 0;
                } else if (char === '}') {
                    if (braceDepth > 0) {
                        braceDepth--;
                        if (stack.length > braceDepth) {
                            stack.pop();
                        }
                    }
                } else if (char === '[') {
                    if (currentKey) {
                        stack.push(currentKey);
                    }
                    bracketDepth++;
                    arrayIndex = 0;
                } else if (char === ']') {
                    if (bracketDepth > 0) {
                        bracketDepth--;
                        if (stack.length > 0) {
                            stack.pop();
                        }
                    }
                } else if (char === ',' && bracketDepth > 0) {
                    arrayIndex++;
                }
            }
        }
    }

    return positions;
}

/**
 * Finds the most appropriate comment for a path.
 * Falls back to shorter paths if exact match not found.
 */
function findCommentForPath(comments: Record<string, string>, path: string): string | undefined {
    // Try exact match first
    if (comments[path]) {
        return comments[path];
    }

    // Try parent paths (for nested values that don't have specific comments)
    const parts = path.split('.');
    for (let i = parts.length - 1; i >= 0; i--) {
        const partialPath = parts.slice(0, i).join('.');
        if (partialPath && comments[partialPath]) {
            return comments[partialPath];
        }
    }

    return undefined;
}

export function deactivate(): void {
    // Cleanup if needed
}