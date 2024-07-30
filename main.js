import fs from 'node:fs/promises';
import path from 'node:path';
import Parser from './parser.js';
import ProgramCodeWriter from './program-code-writer.js';

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

let outputFileHandle = await fs.open('output.asm');

let programCodeWriter = new ProgramCodeWriter(outputFileHandle);

for (let path of filePaths) {
    let fileHandle = await fs.open(path, 'r');

    let parser = new Parser(fileHandle);

    parser.parse();

    let parsedPath = path.parse(path);

    programCodeWriter.currentInputFileName = parsedPath.name;

    for (let command of parser.commands) {
        programCodeWriter.write(command);
    }
}