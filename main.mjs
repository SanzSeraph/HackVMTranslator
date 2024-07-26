import fs from 'node:fs/promises';
import path from 'node:path';

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