import fs from 'node:fs/promises';
import path from 'node:path';
import Parser from './parser.js';

let fileOrFolder = process.argv[2];

let stat = await fs.stat(fileOrFolder);

let filePaths = [];

if (stat.isDirectory()) {
    let dir = await fs.opendir(fileOrFolder);

    for await (const dirent of dir) {
        if (dirent.isFile()) {
            filePaths.push(path.join(dirent.parentPath, dirent.name));
        }
    }
} else {
    filePaths.push(fileOrFolder);
}

for (let path of filePaths) {
    let fileHandle = await fs.open(path, 'r');

    let parser = new Parser(fileHandle);

    parser.parse();

    for (let command of parser.commands) {
        console.log(command);
    }
}