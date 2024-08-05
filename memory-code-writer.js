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
            await this.writeLine('D=A // Load constant in D'); 
            await this.writeLine('@SP // Load SP address'); 
            await this.writeLine('A=M // Load pointer value from memory'); 
            await this.writeLine('M=D // Put loaded value form D on top of stack'); 
            await this.writeIncrementStackPointer();
        } else if (command.arg1 == 'static') {
            await this.writeLine(`@${this._currentFileName}.${command.arg2} // ${command.type} ${command.arg1} ${command.arg2}`); 
            await this.writeLine('D=M // Load the data from static variable to D'); 
            await this.writeLine('@SP');
            await this.writeLine('A=M // Load address from stack pointer'); 
            await this.writeLine('M=D // Put the data at the top of the stack'); 
            await this.writeIncrementStackPointer();
        } else if (command.arg1 == 'pointer') {
            if (command.arg2 == '0') {
                await this.writeLine(`@THIS // ${command.type} ${command.arg1} ${command.arg2}`); 
            } else if (command.arg2 == '1') {
                await this.writeLine(`@THAT // ${command.type} ${command.arg1} ${command.arg2}`); 
            }

            await this.writeLine('D=M // Load THIS/THAT address into D'); 
            await this.writeLine('@SP // Load SP address'); 
            await this.writeLine('A=M // Load value of SP');
            await this.writeLine('M=D // Put THIS address at top of the stack'); 
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
            
            await this.writeLine('D=M // Load value at address');
            await this.writeLine('D=M // Load value of temp location to D'); 
            await this.writeLine('@SP // Load stack pointer address'); 
            await this.writeLine('A=M // Load value of stack pointer to A'); 
            await this.writeLine('M=D // Load value of temp location to top of stack'); 
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
            await this.writeLine('A=M // Load stack pointer address');
            await this.writeLine('D=M // Load item from top of stack');
            await this.writeLine(`@${this._currentFileName}.${command.arg2}`);
            await this.writeLine('M=D // Put item from stack in static location');
        } else if (command.arg1 == 'pointer') {
            await this.writeDecrementStackPointer(`// ${command.type} ${command.arg1} ${command.arg2}`);
            // SP is already in A
            await this.writeLine('A=M // Load stack pointer value');
            await this.writeLine('D=M // Load item from top of stack');
            
            if (command.arg2 == '0') {
                await this.writeLine('@THIS');
            } else if (command.arg2 == '1') {
                await this.writeLine('@THAT');
            }

            await this.writeLine('M=D // Put item from stack in THIS or THAT');
        } else if (command.arg1 == 'temp') {
            await this.writeDecrementStackPointer(`//  ${command.type} ${command.arg1} ${command.arg2}`);
            await this.writeLine('A=M // Load value of stack pointer');
            await this.writeLine('D=M // Load value at top of stack');
            
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

            await this.writeLine('M=D // Put the value from the top of the stack in temp');
        }
    }

    async writePopRelativeSegment(command) {
        if (command.arg1 == 'argument') {
            await this.writeLine(`@ARG // ${command.type} ${command.arg1} ${command.arg2}`); 
            await this.writeLine('A=M // Load the value of ARG'); 
        } else if (command.arg1 == 'local') {
            await this.writeLine(`@LCL // ${command.type} ${command.arg1} ${command.arg2}`); 
            await this.writeLine('A=M // Load the value of ARG');
        } else if (command.arg1 == 'this') {
            await this.writeLine(`@THIS // ${command.type} ${command.arg1} ${command.arg2}`);
            await this.writeLine('A=M // Load the value of THIS');
        } else if (command.arg1 == 'that') {
            await this.writeLine(`@THAT // ${command.type} ${command.arg1} ${command.arg2}`);
            await this.writeLine('A=M // Load the value of THAT');
        }

        await this.writeLine('D=A // Load thevalue of ARG into D'); 
        await this.writeLine(`@${command.arg2} // Load the offset into A`); 
        await this.writeLine('D=D+A // Compute the effective address'); 
        await this.writeLine('@R13 // Load the address of R13'); 
        await this.writeLine('M=D // Store the effective address in R13'); 
        await this.writeDecrementStackPointer();
        // The address of the stack pointer is already loaded
        await this.writeLine('A=M // Load the value of the stack pointer into A'); 
        await this.writeLine('D=M // Load the value from the top of the stack into D'); 
        await this.writeLine(`@${vmMemoryMap.ABS_ADDRESS} // Get the address of R13`); 
        await this.writeLine('A=M // Get the effective address'); 
        await this.writeLine('M=D // Put the value from the stack at the effective address'); 
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

        await this.writeLine('D=M // Put base address in D'); 
        await this.writeLine(`@${command.arg2} // Load offset into a`); 
        await this.writeLine('A=D+A // Compute effective address into A'); 
        await this.writeLine('D=M // Load the data into D'); 
        await this.writeLine('@SP // Load the SP address'); 
        await this.writeLine('A=M // Load the top of stack address'); 
        await this.writeLine('M=D // Put the data at the top of the stcak');
        await this.writeIncrementStackPointer();
    }
}