export default class CodeWriter {
    set currentFileName(value) {
        this._currentFileName = value;
    }

    constructor(fileHandle) {
        this._fileHandle = fileHandle;
    }

    async writeLine(text) {
        this._fileHandle.write(text + '\n');
    }

    async writeDecrementStackPointer() {
        await this.writeLine('@SP // Load stack pointer address');
        await this.writeLine('M=M-1 // Decrement stack pointer value');
    }

    async writeIncrementStackPointer() {
        await this.writeLine('@SP // Load stack pointer address');
        await this.writeLine('M=M+1 // Increment stack pointer value');
    }
}