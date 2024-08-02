import ArithmeticCodeWriter from "./airthmetic-code-writer.js";
import { CommandType } from "./command.js";
import MemoryCodeWriter from "./memory-code-writer.js";
import CodeWriter from './code-writer.js';

const baseAddressPointers = {
    'local': 1,
    'argument': 2,
    'static': 16,
    'pointer': 3,
    'temp': 5
}

export default class ProgramCodeWriter extends CodeWriter {
    set currentInputFileName(name) {
        super.currentInputFileName = name;
        this._arithmeticCodeWriter.currentInputFileName = name;
        this._memoryCodeWriter.currentFileName = name;
    }
    
    constructor(fileHandle) {
        super(fileHandle);
        this._inputFileName = '';
        this._fileHandle = fileHandle;
        this._labelIndex = 0;
        this._arithmeticCodeWriter = new ArithmeticCodeWriter(fileHandle);
        this._memoryCodeWriter = new MemoryCodeWriter(fileHandle);
    }

    async write(command) {
        if (command.type == CommandType.ARITHMETIC) {
            await this._arithmeticCodeWriter.write(command);
        } else if (command.type == CommandType.PUSH || command.type == CommandType.POP) {
            await this._memoryCodeWriter.write(command);
        }
    }    
}