
export class UID {

    public static get(value: any) {
        if (!UID.ids[value]) {
            const uid = new UID(value);
            UID.ids[value] = uid;
            return uid;
        }
        throw new Error("ID with value '" + value + "' already exists!");
    }

    private static ids: Map<any, UID> = new Map();

    public value: Readonly<any>;

    private constructor(value: any) {
        this.value = value;
    }
}

export class DataType {

    private name: string;

    constructor (name: string) {
        this.name = name;
    }

    public toString(): string {
        return this.name;
    }
}

export class Expression {

    private expr: string;

    constructor(expr: string) {
        this.expr = expr;
    }

    public toString(): string {
        return this.expr;
    }
}
