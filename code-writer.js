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

    async writeDecrementStackPointer() {
        await this.writeLine(`@SP`);
        await this.writeLine('M=M-1');
    }

    async writeIncrementStackPointer() {
        await this.writeLine(`@SP`);
        await this.writeLine('M=M+1');
    }
}