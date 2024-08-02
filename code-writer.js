export default class CodeWriter {
    set currentFileName(value) {
        this._currentFileName = value;
    }

    constructor(fileHandle) {
        this._fileHandle = fileHandle;
    }

    async writeLine(text) {
        await this._fileHandle.write(text + '\n');
    }

    async writeDecrementStackPointer(comment) {
        await this.writeLine(`@SP ${comment ? comment : ''}`);
        await this.writeLine('M=M-1');
    }

    async writeIncrementStackPointer(comment) {
        await this.writeLine(`@SP ${comment ? comment : ''}`);
        await this.writeLine('M=M+1 // Increment stack pointer value');
    }
}