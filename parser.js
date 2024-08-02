import Command from "./command.js";

const whitespaceLine = /^[\s]$/;


export default class Parser {
    constructor(fileHandle) {
        this._fileHandle = fileHandle;
        this.commands = [];
    }

    async parse() {
        this.commands = [];

        for await (const line of this._fileHandle.readLines()) {
            this.parseLine(line);
        }
    }

    parseLine(line) {
        // Ignore whitespace
        if (line.length == 0 || line.match(whitespaceLine)) {
            return;
        }

        let trimmedLine = line.trim();

        // Ignore comment lines
        if (trimmedLine.startsWith('//')) {
            return;
        }

        this.commands.push(new Command(trimmedLine));
    }
}