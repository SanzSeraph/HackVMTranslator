import CodeWriter from "./code-writer.js";
import { CommandType } from './command.js';
import { vmMemoryMap } from "./vm-memory-map.js";

const relativeSegments = ['argument', 'local', 'this', 'that'];

export default class MemoryCodeWriter extends CodeWriter {
    constructor(fileHandle) {
        super(fileHandle);
    }

    async write(command) {
        if (command.type == CommandType.PUSH) {
            await this.writePushCommand(command);
        } else if (command.type == CommandType.POP) {
            await this.writePopCommand(command);
        }
    }

    async writePushCommand(command) {
        if (relativeSegments.includes(command.arg1)) {
            await this.writePushRelativeSegment(command);
        } else if (command.arg1 == 'constant') {
            await this.writeLine(`@${command.arg2} // ${command.type} ${command.arg1} ${command.arg2}`);
            await this.writeLine('D=A'); 
            await this.writeLine('@SP'); 
            await this.writeLine('A=M'); 
            await this.writeLine('M=D'); 
            await this.writeIncrementStackPointer();
        } else if (command.arg1 == 'static') {
            await this.writeLine(`@${this._currentFileName}.${command.arg2} // ${command.type} ${command.arg1} ${command.arg2}`); 
            await this.writeLine('D=M'); 
            await this.writeLine('@SP');
            await this.writeLine('A=M'); 
            await this.writeLine('M=D'); 
            await this.writeIncrementStackPointer();
        } else if (command.arg1 == 'pointer') {
            if (command.arg2 == '0') {
                await this.writeLine(`@THIS // ${command.type} ${command.arg1} ${command.arg2}`); 
            } else if (command.arg2 == '1') {
                await this.writeLine(`@THAT // ${command.type} ${command.arg1} ${command.arg2}`); 
            }

            await this.writeLine('D=M'); 
            await this.writeLine('@SP'); 
            await this.writeLine('A=M');
            await this.writeLine('M=D'); 
            await this.writeIncrementStackPointer();
        } else if (command.arg1 == 'temp') {
            switch (command.arg2) {
                case '0':
                    await this.writeLine(`@R5 // ${command.type} ${command.arg1} ${command.arg2}`);
                    break;
                case '1':
                    await this.writeLine(`@R6 // ${command.type} ${command.arg1} ${command.arg2}`);
                    break;
                case '2':
                    await this.writeLine(`@R7 // ${command.type} ${command.arg1} ${command.arg2}`);
                    break;
                case '3':
                    await this.writeLine(`@R8 // ${command.type} ${command.arg1} ${command.arg2}`);
                    break;
                case '4':
                    await this.writeLine(`@R9 // ${command.type} ${command.arg1} ${command.arg2}`);
                    break;
                case '5':
                    await this.writeLine(`@R10 // ${command.type} ${command.arg1} ${command.arg2}`);
                    break;
                case '6':
                    await this.writeLine(`@R11 // ${command.type} ${command.arg1} ${command.arg2}`);
                    break;
                case '7':
                    await this.writeLine(`@R12 //  ${command.type} ${command.arg1} ${command.arg2}`);
                    break;
            }
            
            await this.writeLine('D=M');
            await this.writeLine('D=M'); 
            await this.writeLine('@SP'); 
            await this.writeLine('A=M'); 
            await this.writeLine('M=D'); 
            await this.writeIncrementStackPointer();
        }
    }

    async writePopCommand(command) {
        if (relativeSegments.includes(command.arg1)) {
            await this.writePopRelativeSegment(command);
        } else if (command.arg1 == 'constant') {
            
        } else if (command.arg1 == 'static') {
            await this.writeDecrementStackPointer(`// ${command.type} ${command.arg1} ${command.arg2}`);
            // SP is already in A
            await this.writeLine('A=M');
            await this.writeLine('D=M');
            await this.writeLine(`@${this._currentFileName}.${command.arg2}`);
            await this.writeLine('M=D');
        } else if (command.arg1 == 'pointer') {
            await this.writeDecrementStackPointer(`// ${command.type} ${command.arg1} ${command.arg2}`);
            // SP is already in A
            await this.writeLine('A=M');
            await this.writeLine('D=M');
            
            if (command.arg2 == '0') {
                await this.writeLine('@THIS');
            } else if (command.arg2 == '1') {
                await this.writeLine('@THAT');
            }

            await this.writeLine('M=D');
        } else if (command.arg1 == 'temp') {
            await this.writeDecrementStackPointer(`//  ${command.type} ${command.arg1} ${command.arg2}`);
            await this.writeLine('A=M');
            await this.writeLine('D=M');
            
            switch (command.arg2) {
                case '0':
                    await this.writeLine('@R5');
                    break;
                case '1':
                    await this.writeLine('@R6');
                    break;
                case '2':
                    await this.writeLine('@R7');
                    break;
                case '3':
                    await this.writeLine('@R8');
                    break;
                case '4':
                    await this.writeLine('@R9');
                    break;
                case '5':
                    await this.writeLine('@R10');
                    break;
                case '6':
                    await this.writeLine('@R11');
                    break;
                case '7':
                    await this.writeLine('@R12');
                    break;
            }

            await this.writeLine('M=D');
        }
    }

    async writePopRelativeSegment(command) {
        if (command.arg1 == 'argument') {
            await this.writeLine(`@ARG // ${command.type} ${command.arg1} ${command.arg2}`); 
            await this.writeLine('A=M'); 
        } else if (command.arg1 == 'local') {
            await this.writeLine(`@LCL // ${command.type} ${command.arg1} ${command.arg2}`); 
            await this.writeLine('A=M');
        } else if (command.arg1 == 'this') {
            await this.writeLine(`@THIS // ${command.type} ${command.arg1} ${command.arg2}`);
            await this.writeLine('A=M');
        } else if (command.arg1 == 'that') {
            await this.writeLine(`@THAT // ${command.type} ${command.arg1} ${command.arg2}`);
            await this.writeLine('A=M');
        }

        await this.writeLine('D=A'); 
        await this.writeLine(`@${command.arg2}`); 
        await this.writeLine('D=D+A'); 
        await this.writeLine('@R13'); 
        await this.writeLine('M=D'); 
        await this.writeDecrementStackPointer();
        // The address of the stack pointer is already loaded
        await this.writeLine('A=M'); 
        await this.writeLine('D=M'); 
        await this.writeLine(`@${vmMemoryMap.ABS_ADDRESS}`); 
        await this.writeLine('A=M'); 
        await this.writeLine('M=D'); 
    }

    async writePushRelativeSegment(command) {
        if (command.arg1 == 'argument') {
            await this.writeLine(`@ARG // ${command.type} ${command.arg1} ${command.arg2}`);           
        } else if (command.arg1 == 'local') {
            await this.writeLine(`@LCL // ${command.type} ${command.arg1} ${command.arg2}`); 
        } else if (command.arg1 == 'this') {
            await this.writeLine(`@THIS // ${command.type} ${command.arg1} ${command.arg2}`);
        } else if (command.arg1 == 'that') {
            await this.writeLine(`@THAT // ${command.type} ${command.arg1} ${command.arg2}`);
        }

        await this.writeLine('D=M'); 
        await this.writeLine(`@${command.arg2}`); 
        await this.writeLine('A=D+A'); 
        await this.writeLine('D=M'); 
        await this.writeLine('@SP'); 
        await this.writeLine('A=M'); 
        await this.writeLine('M=D');
        await this.writeIncrementStackPointer();
    }
}