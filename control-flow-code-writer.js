import { CommandType } from './command.js';
import { vmMemoryMap } from './vm-memory-map.js';
import CodeWriter from './code-writer.js';

export default class ControlFlowCodeWriter extends CodeWriter {
    constructor(fileHandle, memoryCodeWriter) {
        super(fileHandle);
        this._memoryCodeWriter = memoryCodeWriter;
        this._currentFunction = 'global';
        this._returnIndex = 0;
    }

    async write(command) {
        if (command.type == CommandType.FUNCTION) {
            await this.writeFunction(command);
        } else if (command.type == CommandType.LABEL) {
            await this.writeLabel(command);
        } else if (command.type == CommandType.GOTO) {
            await this.writeGoto(command);
        } else if (command.type == CommandType.IF) {
            await this.writeIfGoto(command);
        } else if (command.type == CommandType.RETURN) {
            await this.writeReturn(command);
        } else if (command.type == CommandType.CALL) {
            await this.writeCall(command);
        }
    }

    async writeFunction(command) {
        this._currentFunction = command.arg1;
        this.writeLine(`(${this._currentFunction})`);

        let locals = parseInt(command.arg2);

        for (let i = 0; i < locals; i++) {
            await this.writeLine('@0 // Push 0 to top of stack');
            await this.writeLine('D=A');
            await this.writeLine('@SP');
            await this.writeLine('A=M');
            await this.writeLine('M=D');
            await this.writeIncrementStackPointer();
        }
    }

    async writeLabel(command) {
        await this.writeLine(`(${this._currentFunction}$${command.arg1})`);
    }

    async writeGoto(command) {
        await this.writeLine(`@${this._currentFunction}$${command.arg1}`);
        await this.writeLine('0;JMP');
    }

    async writeIfGoto(command) {
        await this.writeLine(`@SP // ${command.type} ${command.arg1}`);
        await this.writeLine('M=M-1');
        await this.writeLine('A=M');
        await this.writeLine('D=M')
        await this.writeLine(`@${this._currentFunction}$${command.arg1}`);
        await this.writeLine('D;JNE');
    }

    async writeReturn(command) {
        await this.writeLine('@SP // Pop the top value from the stack to put in ARG[0]');
        await this.writeLine('A=M-1');
        await this.writeLine('D=M');
        await this.writeLine('@ARG');
        await this.writeLine('A=M');
        await this.writeLine('M=D');
        await this.writeDecrementStackPointer();

        await this.writeLine('@LCL // Restore THAT');
        await this.writeLine('A=M');
        await this.writeLine('A=A-1 // The address of THAT on the stack');        
        await this.writeLine('D=M');
        await this.writeLine('@THAT');
        await this.writeLine('M=D');

        await this.writeLine('@LCL // Restore THIS');
        await this.writeLine('D=M');
        await this.writeLine('@2');
        await this.writeLine('A=D-A // The address of THAT on the stack');
        await this.writeLine('D=M');
        await this.writeLine('@THIS');
        await this.writeLine('M=D');

        await this.writeLine('@ARG // Restore SP');
        await this.writeLine('A=M');
        await this.writeLine('D=A+1');
        await this.writeLine('@SP');
        await this.writeLine('M=D');

        await this.writeLine('@LCL // Restore ARG');
        await this.writeLine('D=M');
        await this.writeLine('@3');
        await this.writeLine('A=D-A // The address of ARG on the stack');
        await this.writeLine('D=M');
        await this.writeLine('@ARG');
        await this.writeLine('M=D');

        await this.writeLine('@LCL // Get return address');
        await this.writeLine('D=M');
        await this.writeLine('@5');
        await this.writeLine('A=D-A // The address of the return address');
        await this.writeLine('D=M');
        await this.writeLine(`@${vmMemoryMap.RETURN}`);
        await this.writeLine('M=D // Temporarily restore the return address');

        await this.writeLine('@LCL // Restore LCL');
        await this.writeLine('D=M');
        await this.writeLine('@4');
        await this.writeLine('A=D-A // The address of LCL on the stack');
        await this.writeLine('D=M');
        await this.writeLine('@LCL');
        await this.writeLine('M=D');

        await this.writeLine(`@${vmMemoryMap.RETURN} // Return`);
        await this.writeLine('A=M');
        await this.writeLine('0;JMP');

        this._currentFunction = 'global';
    }

    async writeCallSysInit() {
        await this.writeCall({
            type: CommandType.FUNCTION,
            arg1: 'Sys.init',
            arg2: '0'
        });
    }

    async writeCall(command) {
        await this.writeLine(`@return.${++this._returnIndex} // Push the return address to the top of the stack`);
        await this.writeLine('D=A');
        await this.writeLine('@SP');
        await this.writeLine('A=M');
        await this.writeLine('M=D');
        await this.writeIncrementStackPointer();
        await this.writeLine('@LCL // Push the LCL address on the top of the stack');
        await this.writeLine('D=M');
        await this.writeLine('@SP')
        await this.writeLine('A=M');
        await this.writeLine('M=D');
        await this.writeIncrementStackPointer();
        await this.writeLine('@ARG // Push the ARG address on the top of the stack');
        await this.writeLine('D=M');
        await this.writeLine('@SP');
        await this.writeLine('A=M');
        await this.writeLine('M=D');
        await this.writeIncrementStackPointer();
        await this.writeLine('@THIS // Put the THIS pointer on the top of the stack');
        await this.writeLine('D=M');
        await this.writeLine('@SP');
        await this.writeLine('A=M');
        await this.writeLine('M=D');
        await this.writeIncrementStackPointer();
        await this.writeLine('@THAT // Put the THAT pointer on the top of the stack')
        await this.writeLine('D=M');
        await this.writeLine('@SP');
        await this.writeLine('A=M');
        await this.writeLine('M=D');
        await this.writeIncrementStackPointer();
        
        let arg2 = parseInt(command.arg2);
        
        await this.writeLine('@SP // Set new ARG to SP - 5 - n');
        await this.writeLine('D=M');
        await this.writeLine(`@${5 + arg2}`);
        await this.writeLine('D=D-A');
        await this.writeLine('@ARG');
        await this.writeLine('M=D');
        
        await this.writeLine('@SP // Set new LCL to SP');
        await this.writeLine('D=M');
        await this.writeLine('@LCL');
        await this.writeLine('M=D');

        await this.writeLine(`@${command.arg1}`);
        await this.writeLine('0;JMP');
        await this.writeLine(`(return.${this._returnIndex})`);
    }
}