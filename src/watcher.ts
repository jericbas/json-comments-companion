import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

const commentCache = new Map<string, { comments: Record<string, string>; mtime: number }>();

function getCommentsPath(jsonPath: string): string | null {
    const config = vscode.workspace.getConfiguration('jsonCommentsCompanion');
    const pattern = config.get<string>('filePattern', '{filename}.comments.json');
    const dir = path.dirname(jsonPath);
    const baseName = path.basename(jsonPath, '.json');
    const commentsFileName = pattern.replace('{filename}', baseName);
    return path.join(dir, commentsFileName);
}

export async function loadCommentsCached(jsonPath: string): Promise<Record<string, string>> {
    const commentsPath = getCommentsPath(jsonPath);
    if (!commentsPath) return {};
    try {
        const stats = fs.statSync(commentsPath);
        const cached = commentCache.get(jsonPath);
        if (cached && cached.mtime === stats.mtimeMs) {
            return cached.comments;
        }
        const content = fs.readFileSync(commentsPath, 'utf-8');
        const parsed = JSON.parse(content) as { comments?: Record<string, string> };
        const comments = parsed.comments || {};
        commentCache.set(jsonPath, { comments, mtime: stats.mtimeMs });
        return comments;
    } catch {
        commentCache.delete(jsonPath);
        return {};
    }
}

export function clearCommentCache(jsonPath: string): void {
    commentCache.delete(jsonPath);
}

export function clearAllCaches(): void {
    commentCache.clear();
}

export function createCommentsFileWatcher(onChange: (jsonPath: string) => void): vscode.FileSystemWatcher {
    const watcher = vscode.workspace.createFileSystemWatcher('**/*.comments.json');
    watcher.onDidChange(uri => handleChange(uri, onChange));
    watcher.onDidCreate(uri => handleChange(uri, onChange));
    watcher.onDidDelete(uri => handleChange(uri, onChange));
    return watcher;
}

function handleChange(commentsUri: vscode.Uri, onChange: (jsonPath: string) => void): void {
    const commentsPath = commentsUri.fsPath;
    const dir = path.dirname(commentsPath);
    const baseName = path.basename(commentsPath, '.comments.json');
    const jsonPath = path.join(dir, `${baseName}.json`);
    if (commentCache.has(jsonPath)) {
        commentCache.delete(jsonPath);
        onChange(jsonPath);
    }
}
