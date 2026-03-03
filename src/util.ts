/**
 * Utility functions for JSON Comments Companion
 */

/**
 * Builds a JSON path by combining parent path with current key.
 * Handles nested objects by joining with dots.
 * 
 * @param key - The current key to add to the path
 * @param parentPath - The parent path to prepend (optional)
 * @returns The full dot-notation path
 * 
 * @example
 * buildJsonPath('name') // 'name'
 * buildJsonPath('version', 'dependencies.lodash') // 'dependencies.lodash.version'
 * buildJsonPath('0', 'items') // 'items.0'
 */
export function buildJsonPath(key: string, parentPath?: string): string {
    if (parentPath && parentPath.length > 0) {
        return `${parentPath}.${key}`;
    }
    return key;
}

/**
 * Parses a dot-notation path string into an array of path segments.
 * Handles array indices and escaped dots.
 * 
 * @param path - Dot-notation path string (e.g., "dependencies.0.name")
 * @returns Array of path segments
 * 
 * @example
 * parsePathString('scripts.build') // ['scripts', 'build']
 * parsePathString('items.0.name') // ['items', '0', 'name']
 */
export function parsePathString(path: string): string[] {
    return path.split('.').filter(segment => segment.length > 0);
}

/**
 * Resolves a value at a given dot-notation path in a nested object.
 * Supports array indices.
 * 
 * @param obj - The object to traverse
 * @param path - Dot-notation path
 * @returns The value at the path, or undefined if not found
 * 
 * @example
 * resolvePath({ scripts: { build: 'npm run build' } }, 'scripts.build') // 'npm run build'
 * resolvePath({ items: [{ name: 'foo' }] }, 'items.0.name') // 'foo'
 */
export function resolvePath(obj: Record<string, unknown>, path: string): unknown {
    const segments = parsePathString(path);
    let current: unknown = obj;
    
    for (const segment of segments) {
        if (current === null || current === undefined) {
            return undefined;
        }
        
        if (Array.isArray(current)) {
            const index = parseInt(segment, 10);
            if (isNaN(index)) {
                return undefined;
            }
            current = current[index];
        } else if (typeof current === 'object') {
            current = (current as Record<string, unknown>)[segment];
        } else {
            return undefined;
        }
    }
    
    return current;
}
