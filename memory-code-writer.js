import CodeWriter from "./code-writer.js";

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
            await this.writePushToRelativeSegment();
        }
        if (command.arg1 == 'constant') {
            await this.writeLine(`@${command.arg2} // Load constant in A`);
            await this.writeLine('D=A // Load constant in D'); 
            await this.writeLine('@SP // Load SP address'); 
            await this.writeLine('A=M // Load pointer value from memory'); 
            await this.writeLine('M=D // Put loaded value form D on top of stack'); 
            await this.writeIncrementStackPointer();
        } else if (command.arg1 == 'argument') {
            await this.writeLine('@ARG');
            await this.writeLine('D=M // Put base argument address in D'); 
            await this.writeLine(`@${command.arg2} // Load offset into a`); 
            await this.writeLine('A=D+A // Compute effective address into A'); 
            await this.writeLine('D=M // Load the data into D'); 
            await this.writeLine('@SP // Load the SP address'); 
            await this.writeLine('A=M // Load the top of stack address'); 
            await this.writeLine('M=D // Put the data at the top of the stcak'); 
            await this.writeIncrementStackPointer();
        } else if (command.arg1 == 'local') {
            await this.writeLine('@LCL // Load base local address'); 
            await this.writeLine('D=M // Load value of base local address into D'); 
            await this.writeLine(`@${command.arg2} // Load offset into A`); 
            await this.writeLine('A=A+D // Compute effective address into A'); 
            await this.writeLine('D=M // Load data from effective address into D'); 
            await this.writeLine('@SP');
            await this.writeLine('A=M // Load the top of stack address'); 
            await this.writeLine('M=D // Put the data at the top of the stack'); 
            await this.writeIncrementStackPointer();
        } else if (command.arg1 == 'static') {
            await this.writeLine('@16 // Load base static address'); 
            await this.writeLine('D=A // Load static address in D'); 
            await this.writeLine(`@${command.arg2} // Load offset into A`); 
            await this.writeLine('A=A+D // Comput effective address into A'); 
            await this.writeLine('D=M // Load the data from effective address into D'); 
            await this.writeLine('@SP');
            await this.writeLine('A=M // Load address from stack pointer'); 
            await this.writeLine('M=D // Put the data at the top of the stack'); 
            await this.writeIncrementStackPointer();
        } else if (command.arg1 == 'pointer') {
            if (command.ar2 == '0') {
                await this.writeLine('@THIS // Load THIS address'); 
            } else if (command.arg2 == '1') {
                await this.writeLine('@THAT // Load THAT address'); 
            }

            await this.writeLine('D=M // Load THIS/THAT address into D'); 
            await this.writeLine('@SP // Load SP address'); 
            await this.writeLine('M=D // Put THIS address at top of the stack'); 
            await this.writeIncrementStackPointer();
        } else if (command.arg1 == 'this') {
            await this.writeLine('@THIS // Load THIS address'); 
            await this.writeLine('D=M // Load this address into D'); 
            await this.writeLine(`@${command.arg2} // Load offset into address`); 
            await this.writeLine('A=A+D // Compute effective address'); 
            await this.writeLine('D=M // Load contents of address into D'); 
            await this.writeLine('@SP');
            await this.writeLine('A=M // Load stack pointer value into A'); 
            await this.writeLine('M=D // Load this value into top of stack'); 
            await this.writeIncrementStackPointer();
        } else if (command.arg1 == 'that') {
            await this.writeLine('@THAT // Load THAT address'); 
            await this.writeLine('D=M // Load that value into D'); 
            await this.writeLine(`@${command.arg2} // Load offset into A`); 
            await this.writeLine('A=A+D // Compute effective address'); 
            await this.writeLine('D=M // Load THAT value into D'); 
            await this.writeLine('@SP // Load stack pointer address'); 
            await this.writeLine('A=M // Load stack pointer value'); 
            await this.writeLine('M=D // Load D into top of stack'); 
            await this.writeIncrementStackPointer();
        } else if (command.arg1 == 'temp') {
            await this.writeLine('@R5 // Load address of RAM[5]'); 
            await this.writeLine('D=A // Load address of RAM[5] into D'); 
            await this.writeLine(`@${command.arg2} // Load offset`); 
            await this.writeLine('A=A+D // Compute effective address'); 
            await this.writeLine('D=M // Load value of temp location to D'); 
            await this.writeLine('@SP // Load stack pointer address'); 
            await this.writeLine('A=M // Load value of stack pointer to A'); 
            await this.writeLine('M=D // Load value of temp location to top of stack'); 
            await this.writeIncrementStackPointer();
        }
    }

    async writePopCommand(command) {
        if (command.arg1 == 'constant') {

        } else if (command.arg1 == 'argument') {
            await this.writeLine('@ARG // Load the address of arg'); 
            await this.writeLine('A=M // Load the value of ARG'); 
        } else if (command.arg1 == 'local') {
            await this.writeLine('@LCL // Load the address of arg'); 
            await this.writeLine('A=M // Load the value of ARG'); 
        } else if (command.arg1 == 'static') {
            await this.writeLine('@16 // Load the stating address of static');            
        } else if (command.arg1 == 'this') {
            await this.writeLine('@THIS // Load the address of THIS');
            await this.writeLine('A=M // Load the value of THIS');
        } else if (command.arg1 == 'that') {
            await this.writeLine('@THAT // Load the address of THAT');
            await this.writeLine('A=M // Load the value of THAT');
        }

        await this.writeLine('A=M // Load the value of ARG'); 
        await this.writeLine('D=A // Load thevalue of ARG into D'); 
        await this.writeLine(`@${command.arg2} // Load the offset into A`); 
        await this.writeLine('D=D+A // Compute the effective address'); 
        await this.writeLine('@R13 // Load the address of R13'); 
        await this.writeLine('M=D // Store the effective address in R13'); 
        await this.writeDecrementStackPointer();
        // The address of the stack pointer is already loaded
        await this.writeLine('A=M // Load the value of the stack pointer into A'); 
        await this.writeLine('D=M // Load the value from the top of the stack into D'); 
        await this.writeLine('@R13 // Get the address of R13'); 
        await this.writeLine('A=M // Get the effective address'); 
        await this.writeLine('M=D // Put the value from the stack at the effective address'); 
    }

    async writePushToRelativeSegment(command) {
        if (command.arg1 == 'argument') {
            await this.writeLine('@ARG');           
        } else if (command.arg1 == 'local') {
            await this.writeLine('@LCL'); 
        } else if (command.arg1 == 'this') {
            await this.writeLine('@THIS')
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