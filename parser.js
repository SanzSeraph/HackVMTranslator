import Command from "./command";

const whitespaceLine = /^[\s]$/;


export default class Parser {
    constructor(fileHandle) {
        this._fileHandle = fileHandle;
        this._commands
    }

    async parse() {
        this.commands = [];

        for await (const line of _fileHandle.readLines()) {
            this.parseLine(line);
        }

        for (let command of this._commands) {
            console.log(command);
        }
    }

    parseLine(line) {
        // Ignore whitespace
        if (line.length == 0 || line.match(whitespaceLine)) {
            return;
        }

        let trimmedLine = line.trim();

        if (trimmedLine.startsWith('//')) {
            return;
        }

        this._commands.push(new Command(trimmedLine));
    }
}