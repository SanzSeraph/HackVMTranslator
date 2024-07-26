const unary = [
    'neg',
    'not'
];

export default class ArithmeticCommand {
    constructor(line) {
        let parts = line.split(' ').filter(p => p !== '');

        this.operation = parts[0];
        this.operand1 = parts[1];

        if (!unary.includes(this.operation)) {
            this.operand2 = parts[2];
        }
    }
}