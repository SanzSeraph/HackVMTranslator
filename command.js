export default class Command {
    constructor(rawLine) {
        this._rawLine = rawLine;
        this.arg1 = '';
        this.arg2 = '';

        let parts = rawLine.split(/[\s]+/).filter(p => p !== '');

        if (parts.length) {
            switch (parts[0]) {
                case 'add':
                case 'sub':
                case 'neg':
                case 'eq':
                case 'gt':
                case 'lt':
                case 'and':
                case 'or':
                case 'not':
                    this.type = CommandType.ARITHMETIC;
                    this.parseArithmetic(parts);
                    break;
                case 'push':
                    this.type = CommandType.PUSH;
                    this.parseBinary(parts);
                    break;
                case 'pop':
                    this.type = CommandType.POP;
                    this.parseBinary(parts);
                    break;
                case 'label':
                    this.type = CommandType.LABEL;
                    this.parseUnary(parts);
                    break;
                case 'goto':
                    this.type = CommandType.GOTO;
                    this.parseUnary(parts);
                    break;
                case 'if-goto':
                    this.type = CommandType.IF;
                    this.parseUnary(parts);
                    break;
                case 'function':
                    this.type = CommandType.FUNCTION;
                    this.parseBinary(parts);
                    break;
                case 'call':
                    this.type = CommandType.CALL;
                    this.parseBinary(parts);
                    break;
                case 'return':
                    this.type = CommandType.RETURN;
            }
        }
    }

    parseArithmetic(parts) {
        this.arg1 = parts[0];
    }

    parseUnary(parts) {
        this.arg1 = parts[1];
    }

    parseBinary(parts) {
        this.arg1 = parts[1];
        this.arg2 = parts[2];
    }
}

export const CommandType = {
    UNKNOWN: 'Unknown',
    ARITHMETIC: 'Arithmetic',
    PUSH: 'Push',
    POP: 'Pop',
    LABEL: 'Label',
    GOTO: 'Goto',
    IF: 'If',
    FUNCTION: 'Function',
    RETURN: 'Return',
    CALL: 'Call',
    COMMENT: 'Comment'
};