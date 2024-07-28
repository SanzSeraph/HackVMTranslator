import { CommandType } from "./command.js";

const baseAddressPointers = {
    'local': 1,
    'argument': 2,
    'static': 16,
    'pointer': 3,
    'temp': 5
}

export default class CodeWriter {
    constructor(fileHandle) {
        this._fileHandle = fileHandle;
        this._labelIndex = 0;
    }

    set currentInputFileName(name) {
        this._inputFileName = name;
    }

    async write(command) {
        if (command.type == CommandType.ARITHMETIC) {
            await this.writeArithmetic(command);
        } else if (command.type == CommandType.PUSH || command.type == CommandType.POP) {
            await this.writePushPop(command);
        }
    }

    async writeArithmetic(command) {
        if (command.arg1 == 'add') {
            await this.writeBinaryArithmeticOperation(async () => await this.writeLine('M=M+D'));
        } else if (command.arg1 == 'sub') {
            await this.writeBinaryArithmeticOperation(async () => await this.writeLine('M=M-D'));
        } else if (command.arg1 == 'neg') {
            await this.writeUnaryArithmeticOperation(async () => await this.writeLine('M=-M'));
        } else if (command.arg1 == 'and') {
            await this.writeBinaryArithmeticOperation(async () => await this.writeLine('M=D&M'));
        } else if (command.arg1 == 'or') {
            await this.writeBinaryArithmeticOperation(async () => await this.writeLine('M=D|M'));
        } else if (command.arg1 == 'not') {
            await this.writeUnaryArithmeticOperation(async () => await this.writeLine('M=!M'));
        } else if (command.arg1 == 'eq') {
            await this.writeBinaryArithmeticOperation(async () => {
                await this.writeLine(`@eq.${++this._labelIndex}`);
                await this.writeLine('D-M;JEQ');
                await this.writeLine('M=0');
                await this.writeLine(`@endeq.${this._labelIndex}`);
                await this.writeLine('0;JMP');
                await this.writeLine(`(eq.${this._labelIndex})`);
                await this.writeLine('M=-1');
                await this.writeLine(`(endeq.${this._labelIndex})`);
            });
        } else if (command.arg1 == 'lt') {
            await this.writeBinaryArithmeticOperation(async () => {
                await this.writeLine(`@lt.${++this._labelIndex}`);
                await this.writeLine('M-D;JLT');
                await this.writeLine('M=0');
                await this.writeLine(`@endlt.${this._labelIndex}`);
                await this.writeLine('0;JMP');
                await this.writeLine(`(lt.${this._labelIndex})`);
                await this.writeLine('M=-1');
                await this.writeLine(`(endlt.${this.labelIndex})`)
            });
        } else if (command.arg1 == 'gt') {
            await this.writeBinaryArithmeticOperation(async () => {
                await this.writeLine(`@gt.${++this._labelIndex}`);
                await this.writeLine('M-D;JGT');
                await this.writeLine('M=0');
                await this.writeLine(`@endgt.${this._labelIndex}`);
                await this.writeLine('0;JMP');
                await this.writeLine(`(gt.${this._labelIndex})`);
                await this.writeLine('M=-1');
                await this.writeLine(`(endlt.${this.labelIndex})`);
            });
        }
    }

    async writePushPop(command) {
        if (command.type == CommandType.PUSH) {
            await this.writePushCommand(command);
        }
    }

    async writePushCommand(command) {
        if (command.arg1 == 'constant') {
            await this.writeLine(`@${command.arg2}`); // Load constant in A
            await this.writeLine('D=A'); // Load constant in D
            await this.writeLine('@SP'); // Load SP address
            await this.writeLine('A=M'); // Load pointer value from memory
            await this.writeLine('M=D'); // Put loaded value form D on top of stack
            await this.writeIncrementStackPointer();
        } else if (command.arg1 == 'argument') {
            await this.writeLine('@ARG');
            await this.writeLine('D=M'); // Put base argument address in D
            await this.writeLine(`@${command.arg2}`); // Load offset into a
            await this.writeLine('A=D+A'); // Compute effective address into A
            await this.writeLine('D=M'); // Load the data into D
            await this.writeLine('@SP'); // Load the SP address
            await this.writeLine('A=M'); // Load the top of stack address
            await this.writeLine('M=D'); // Put the data at the top of the stcak
            await this.writeIncrementStackPointer();
        } else if (command.arg1 == 'local') {
            await this.writeLine('@LCL'); // Load base local address
            await this.writeLine('D=M'); // Load value of base local address into D
            await this.writeLine(`@${command.arg2}`); // Load offset into A
            await this.writeLine('A=A+D'); // Compute effective address into A
            await this.writeLine('D=M'); // Load data from effective address into D
            await this.writeLine('@SP');
            await this.writeLine('A=M'); // Load the top of stack address
            await this.writeLine('M=D'); // Put the data at the top of the stack
            await this.writeIncrementStackPointer();
        } else if (command.arg1 == 'static') {
            await this.writeLine('@16'); // Load base static address
            await this.writeLine('D=A'); // Load static address in D
            await this.writeLine(`@${command.arg2}`); // Load offset into A
            await this.writeLine('A=A+D'); // Comput effective address into A
            await this.writeLine('D=M'); // Load the data from effective address into D
            await this.writeLine('@SP');
            await this.writeLine('A=M'); // Load address from stack pointer
            await this.writeLine('M=D'); // Put the data at the top of the stack
            await this.writeIncrementStackPointer();
        } else if (command.arg1 == 'pointer') {
            if (command.ar2 == '0') {
                await this.writeLine('@THIS'); // Load THIS address
                
            } else if (command.arg2 == '1') {
                await this.writeLine('@THAT'); // Load THAT address
            }

            await this.writeLine('D=M'); // Load THIS/THAT address into D
            await this.writeLine('@SP'); // Load SP address
            await this.writeLine('M=D'); // Put THIS address at top of the stack
            await this.writeIncrementStackPointer();
        } else if (command.arg1 == 'this') {
            
        }
    }

    async writeUnaryArithmeticOperation(assemblyCommand) {
        await this.writeDecrementStackPointer();
        await assemblyCommand();
        await this.writeIncrementStackPointer();
    }

    async writeBinaryArithmeticOperation(dAssemblyCommand) {
        await this.writeDecrementStackPointer();
        await this.writeLoadMemoryToD();
        await this.writeDecrementStackPointer();
        await dAssemblyCommand();
        await this.writeIncrementStackPointer();
    }

    async writeDecrementStackPointer() {
        await this.writeLine('@SP');
        await this.writeLine('M=M-1');
    }

    async writeIncrementStackPointer() {
        await this.writeLine('@SP');
        await this.writeLine('M=M+1');
    }

    async writeLoadMemoryToD() {
        await this.writeLine('D=M');
    }

    async writeLine(text) {
        this._fileHandle.write(text + '\n');
    }
}