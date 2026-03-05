import { expect } from 'chai';
import { buildJsonPath, parsePathString, resolvePath } from '../../src/util';

describe('util', () => {
    describe('buildJsonPath', () => {
        it('should return key when no parent path', () => {
            expect(buildJsonPath('name')).to.equal('name');
        });

        it('should combine parent and key', () => {
            expect(buildJsonPath('build', 'scripts')).to.equal('scripts.build');
        });

        it('should handle nested paths', () => {
            expect(buildJsonPath('version', 'dependencies.lodash')).to.equal('dependencies.lodash.version');
        });

        it('should handle array indices as key', () => {
            expect(buildJsonPath('0', 'items')).to.equal('items.0');
        });
    });

    describe('parsePathString', () => {
        it('should split simple path', () => {
            expect(parsePathString('scripts.build')).to.deep.equal(['scripts', 'build']);
        });

        it('should split nested path', () => {
            expect(parsePathString('a.b.c.d')).to.deep.equal(['a', 'b', 'c', 'd']);
        });

        it('should handle single key', () => {
            expect(parsePathString('name')).to.deep.equal(['name']);
        });

        it('should filter empty segments', () => {
            expect(parsePathString('a..b')).to.deep.equal(['a', 'b']);
        });
    });

    describe('resolvePath', () => {
        it('should resolve simple property', () => {
            const obj = { name: 'test' };
            expect(resolvePath(obj, 'name')).to.equal('test');
        });

        it('should resolve nested property', () => {
            const obj = { scripts: { build: 'tsc' } };
            expect(resolvePath(obj, 'scripts.build')).to.equal('tsc');
        });

        it('should resolve array index', () => {
            const obj = { items: [{ name: 'first' }, { name: 'second' }] };
            expect(resolvePath(obj, 'items.0.name')).to.equal('first');
            expect(resolvePath(obj, 'items.1.name')).to.equal('second');
        });

        it('should return undefined for missing property', () => {
            const obj = { name: 'test' };
            expect(resolvePath(obj, 'missing')).to.be.undefined;
        });

        it('should return undefined for missing nested property', () => {
            const obj = { scripts: {} };
            expect(resolvePath(obj, 'scripts.missing')).to.be.undefined;
        });

        it('should handle null intermediate values', () => {
            const obj = { data: null };
            expect(resolvePath(obj, 'data.prop')).to.be.undefined;
        });
    });
});
