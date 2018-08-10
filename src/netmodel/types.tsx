
export interface BoundingBox {
    y: number;
    x: number;
    width: number;
    height: number;
}

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
