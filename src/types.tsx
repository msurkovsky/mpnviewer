

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


export class Expression {

    private expr: string;

    constructor(expr: string = "") {
        this.expr = expr;
    }

    public toString(): string {
        return this.expr;
    }

    public isEmpty(): boolean {
        return this.expr !== "";
    }
}


export class DataType {

    public static get(name: string): DataType {
        if (this.types[name] === undefined) {
            this.types[name] = new DataType(name);
        }

        return this.types[name];
    }

    private static types: Map<string, DataType> = new Map();

    private name: string;

    private constructor (name: string) {
        this.name = name;
    }

    public toString(): string {
        return this.name;
    }
}

export const mpnUnit = DataType.get("unit");
export const mpnBoolean = DataType.get("boolean");
export const mpnInteger = DataType.get("integer");
