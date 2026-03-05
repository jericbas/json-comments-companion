import Mocha from 'mocha';
import * as path from 'path';
import * as fs from 'fs';

async function runUnitTests(): Promise<void> {
    const mocha = new Mocha({
        ui: 'bdd',
        color: true,
        timeout: 10000
    });

    const testDir = path.join(__dirname);

    // Find all test files
    const testFiles = fs.readdirSync(testDir)
        .filter(f => f.endsWith('.test.ts'))
        .map(f => path.join(testDir, f));

    // Add files to mocha
    testFiles.forEach(f => mocha.addFile(f));

    // Run tests
    return new Promise((resolve, reject) => {
        mocha.run(failures => {
            if (failures > 0) {
                reject(new Error(`${failures} tests failed`));
            } else {
                resolve();
            }
        });
    });
}

runUnitTests().catch(err => {
    console.error(err);
    process.exit(1);
});
