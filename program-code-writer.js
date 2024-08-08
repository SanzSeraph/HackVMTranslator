import ArithmeticCodeWriter from "./airthmetic-code-writer.js";
import { CommandType } from "./command.js";
import MemoryCodeWriter from "./memory-code-writer.js";
import CodeWriter from './code-writer.js';
import ControlFlowCodeWriter from "./control-flow-code-writer.js";

export default class ProgramCodeWriter extends CodeWriter {
    set currentFileName(name) {
        super.currentFileName = name;
        this._arithmeticCodeWriter.currentFileName = name;
        this._memoryCodeWriter.currentFileName = name;
        this._controlFlowCodeWriter.currentFileName = name;
    }
    
    constructor(fileHandle) {
        super(fileHandle);
        this._inputFileName = '';
        this._fileHandle = fileHandle;
        this._labelIndex = 0;
        this._arithmeticCodeWriter = new ArithmeticCodeWriter(fileHandle);
        this._memoryCodeWriter = new MemoryCodeWriter(fileHandle);
        this._controlFlowCodeWriter = new ControlFlowCodeWriter(fileHandle);
        this._inFunction = true;
    }

    async writeBootstrap() {
        await this.writeLine('@256 // Initialize SP to 256');
        await this.writeLine('D=A');
        await this.writeLine('@SP');
        await this.writeLine('M=D');
        await this._controlFlowCodeWriter.writeCallSysInit();
    }

    async write(command) {
        if (command.type == CommandType.ARITHMETIC) {
            await this._arithmeticCodeWriter.write(command);
        } else if (command.type == CommandType.PUSH || command.type == CommandType.POP) {
            await this._memoryCodeWriter.write(command);
        } else if (command.type == CommandType.FUNCTION) {
            await this._controlFlowCodeWriter.write(command);
        } else if (command.type == CommandType.RETURN) {
            await this._controlFlowCodeWriter.write(command);
        } else if (command.type == CommandType.CALL) {
            await this._controlFlowCodeWriter.write(command);
        } else if (command.type == CommandType.LABEL) {
            await this._controlFlowCodeWriter.write(command);
        } else if (command.type == CommandType.GOTO) {
            await this._controlFlowCodeWriter.write(command);
        } else if (command.type == CommandType.IF) {
            await this._controlFlowCodeWriter.write(command);
        }
    }    
}