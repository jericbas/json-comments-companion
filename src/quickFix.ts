import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { loadCommentsCached, clearCommentCache } from './watcher';

export class AddCommentQuickFixProvider implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix];

    async provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range
    ): Promise<vscode.CodeAction[]> {
        const actions: vscode.CodeAction[] = [];
        const jsonPath = document.uri.fsPath;
        const commentsPath = this.getCommentsPath(jsonPath);
        if (!commentsPath) return actions;

        const comments = await loadCommentsCached(jsonPath);
        const keyInfo = this.getKeyAtPosition(document, range.start);
        if (!keyInfo) return actions;

        const hasComment = comments[keyInfo.fullPath]?.trim().length > 0;
        if (!hasComment) {
            const action = new vscode.CodeAction(
                `💬 Add comment for "${keyInfo.key}"`,
                vscode.CodeActionKind.QuickFix
            );
            action.command = {
                command: 'jsonCommentsCompanion.addCommentForKey',
                title: 'Add comment',
                arguments: [document.uri, keyInfo.fullPath, keyInfo.key]
            };
            action.isPreferred = true;
            actions.push(action);
        }

        return actions;
    }

    private getCommentsPath(jsonPath: string): string | null {
        const config = vscode.workspace.getConfiguration('jsonCommentsCompanion');
        const pattern = config.get<string>('filePattern', '{filename}.comments.json');
        const dir = path.dirname(jsonPath);
        const baseName = path.basename(jsonPath, '.json');
        return path.join(dir, pattern.replace('{filename}', baseName));
    }

    private getKeyAtPosition(doc: vscode.TextDocument, pos: vscode.Position): { key: string; fullPath: string } | null {
        const line = doc.lineAt(pos.line).text;
        const match = line.match(/"([^"]+)"\s*:/);
        if (!match) return null;
        const key = match[1];
        return { key, fullPath: key };
    }
}

export async function addCommentForKey(
    uri: vscode.Uri,
    keyPath: string,
    keyName: string
): Promise<void> {
    const jsonPath = uri.fsPath;
    const config = vscode.workspace.getConfiguration('jsonCommentsCompanion');
    const pattern = config.get<string>('filePattern', '{filename}.comments.json');
    const dir = path.dirname(jsonPath);
    const baseName = path.basename(jsonPath, '.json');
    const commentsPath = path.join(dir, pattern.replace('{filename}', baseName));

    let comments: Record<string, string> = {};
    if (fs.existsSync(commentsPath)) {
        try {
            const content = fs.readFileSync(commentsPath, 'utf-8');
            comments = JSON.parse(content).comments || {};
        } catch {
            // ignore
        }
    }

    if (!comments[keyPath]) {
        comments[keyPath] = '';
    }

    const newContent = JSON.stringify({ comments }, null, 2);
    fs.writeFileSync(commentsPath, newContent);
    clearCommentCache(jsonPath);

    const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(commentsPath));
    const editor = await vscode.window.showTextDocument(doc);

    const text = doc.getText();
    const keyMatch = text.match(new RegExp(`"${keyPath}": ""`));
    if (keyMatch) {
        const pos = text.indexOf(keyMatch[0]) + keyMatch[0].length - 1;
        const line = doc.positionAt(pos).line;
        const char = doc.positionAt(pos).character;
        editor.selection = new vscode.Selection(line, char - 1, line, char - 1);
    }
}
