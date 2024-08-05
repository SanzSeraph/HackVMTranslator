import { CommandType } from 'command.js';
import { vmMemoryMap } from './vm-memory-map.js';

export default class ControlFlowCodeWriter extends CodeWriter {
    constructor(fileHandle, memoryCodeWriter) {
        super(fileHandle);
        this._memoryCodeWriter = memoryCodeWriter;
        this._currentFunction = '';
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
        this.currentFunction = command.arg1;
        this.writeLine(`(${this._currentFunction})`);

        let locals = parseInt(command.arg2);

        for (let i = 0; i < locals; i++) {
            this.writeLine('@0 // Push 0 to top of stack');
            this.writeLine('D=A');
            this.writeLine('@SP');
            this.writeLine('A=M');
            this.writeLine('M=D');
            this.writeIncrementStackPointer();
        }
    }

    async writeLabel(command) {
        this.writeLine(`(${this._currentFunction}$${command.arg1})`);
    }

    async writeGoto(command) {
        this.writeLine(`@${this._currentFunction}$${command.arg1}`);
        this.writeLine('0;JMP');
    }

    async writeIfGoto(command) {
        this.writeLine('@SP // Get the item at the top of the stack');
        this.writeLine('A=M');
        this.writeLine('D=M');
        this.writeDecrementStackPointer();
        this.writeLine(`@${this._currentFunction}.${command.arg1} // Go to the label if true`);
        this.writeLine('D;JEQ')
    }

    async writeReturn(command) {
        this.writeLine('@SP // Pop the top value from the stack to put in ARG[0]');
        this.writeLine('A=M');
        this.writeLine('D=M');
        this.writeLine('@ARG');
        this.writeLine('A=M');
        this.writeLine('M=D');
        this.writeDecrementStackPointer();

        this.writeLine('@LCL // Restore THAT');
        this.writeLine('A=M');
        this.writeLine('A=A-1 // The address of THAT on the stack');        
        this.writeLine('D=M');
        this.writeLine('@THAT');
        this.writeLine('M=D');

        this.writeLine('@LCL // Restore THIS');
        this.writeLine('D=M');
        this.writeLine('@2');
        this.writeLine('A=D-A // The address of THAT on the stack');
        this.writeLine('D=M');
        this.writeLine('@THIS');
        this.writeLine('M=D');

        this.writeLine('@ARG // Restore SP');
        this.writeLine('A=M');
        this.writeLine('D=A+1');
        this.writeLine('@SP');
        this.writeLine('M=D');

        this.writeLine('@LCL // Restore ARG');
        this.writeLine('D=M');
        this.writeLine('@3');
        this.writeLine('A=D-A // The address of ARG on the stack');
        this.writeLine('D=M');
        this.writeLine('@ARG');
        this.writeLine('M=D');

        this.writeLine('@LCL // Get return address');
        this.writeLine('D=M');
        this.writeLine('@5');
        this.writeLine('A=D-A // The address of the return address');
        this.writeLine('D=M');
        this.writeLine(`@${vmMemoryMap.RETURN}`);
        this.writeLine('M=D // Temporarily restore the return address');

        this.writeLine('@LCL // Restore LCL');
        this.writeLine('D=M');
        this.writeLine('@4');
        this.writeLine('A=D-A // The address of LCL on the stack');
        this.writeLine('D=M');
        this.writeLine('@LCL');
        this.writeLine('M=D');

        this.writeLine(`@${vmMemoryMap.RETURN} // Return`);
        this.writeLine('A=M');
        this.writeLine('0;JMP');

        this._currentFunction = '';
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
        await this.writeLine(`(return-${this._returnIndex})`);
    }
}