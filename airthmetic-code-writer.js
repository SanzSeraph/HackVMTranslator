import CodeWriter from "./code-writer.js";

const binaryOperations = [ 'add', 'sub', 'and', 'or', 'eq', 'lt', 'gt' ];

export default class ArithmeticCodeWriter extends CodeWriter {
    set currentInputFileName(name) {
        this._inputFileName = name;
    }

    constructor(fileHandle) {
        super(fileHandle);
        this._labelIndex = 0;
        this._inputFileName = '';
        this._fileHandle = fileHandle;
    }

    async write(command) {
        if  (binaryOperations.includes(command.arg1)) {
            await this.writeBinaryOperation(command);
        } else {
            await this.writeUnaryOperation(command);
        }
    }

    async writeUnaryOperation(command) {
        await this.writeDecrementStackPointer(`// ${command.type} ${command.arg1} ${command.arg2}`);
        await this.writeLine('A=M');

        if (command.arg1 == 'neg') {
            await this.writeLine('M=-M');
        } else if (command.arg1 == 'not') {
            await this.writeLine('M=!M');
        } 
        
        await this.writeIncrementStackPointer();
    }

    async writeBinaryOperation(command) {
        await this.writeDecrementStackPointer(`// ${command.type} ${command.arg1} ${command.arg2}`);
        await this.writeLine('A=M');
        await this.writeLine('D=M');
        await this.writeDecrementStackPointer();
        // Address is already set to SP
        await this.writeLine('A=M');

        if (command.arg1 == 'add') {
            await this.writeLine('M=D+M');
        } else if (command.arg1 == 'sub') {
            await this.writeLine('M=M-D');
        } else if (command.arg1 == 'and') {
            await this.writeLine('M=D&M');
        } else if (command.arg1 == 'or') {
            await this.writeLine('M=D|M');
        } else if (command.arg1 == 'eq') {
            await this.writeLine('D=D-M')
            await this.writeLine(`@eq.${++this._labelIndex}`);
            await this.writeLine('D;JEQ');
            await this.writeLine('@SP');
            await this.writeLine('A=M');
            await this.writeLine('M=0');
            await this.writeLine(`@endeq.${this._labelIndex}`);
            await this.writeLine('0;JMP');
            await this.writeLine(`(eq.${this._labelIndex})`);
            await this.writeLine('@SP');
            await this.writeLine('A=M');
            await this.writeLine('M=-1');
            await this.writeLine(`(endeq.${this._labelIndex})`);
        } else if (command.arg1 == 'lt') {
            await this.writeLine('D=M-D')
            await this.writeLine(`@lt.${++this._labelIndex}`);
            await this.writeLine('D;JLT');
            await this.writeLine('@SP');
            await this.writeLine('A=M');
            await this.writeLine('M=0');
            await this.writeLine(`@endlt.${this._labelIndex}`);
            await this.writeLine('0;JMP');
            await this.writeLine(`(lt.${this._labelIndex})`);
            await this.writeLine('@SP');
            await this.writeLine('A=M');
            await this.writeLine('M=-1');
            await this.writeLine(`(endlt.${this._labelIndex})`);
        } else if (command.arg1 == 'gt') {
            await this.writeLine('D=M-D')
            await this.writeLine(`@gt.${++this._labelIndex}`);
            await this.writeLine('D;JGT');
            await this.writeLine('@SP');
            await this.writeLine('A=M');
            await this.writeLine('M=0');
            await this.writeLine(`@endgt.${this._labelIndex}`);
            await this.writeLine('0;JMP');
            await this.writeLine(`(gt.${this._labelIndex})`);
            await this.writeLine('@SP');
            await this.writeLine('A=M');
            await this.writeLine('M=-1');
            await this.writeLine(`(endgt.${this._labelIndex})`);
        }

        await this.writeIncrementStackPointer();
    }
}