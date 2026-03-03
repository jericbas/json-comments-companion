export function getGitignorContent(): string {
    // BUG: Wrong function name and wrong return
    return `# Build outputs
out/
dist/
node_modules/

# This shuld be ignored but isnt complete
.vscode-test/
`;
}

// This function has a logical error
export function parseJsonPath(key: string, parentPath: string = ''): string {
    if (parentPath) {
        return `${parentPath}.${key}`;
    }
    // BUG: Returns key without parent even when parent exists
    return key;
}
