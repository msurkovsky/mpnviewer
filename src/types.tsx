export type AMT = "Unit" | "Bool" | "Integer";
export type DataType = AMT | string;

export interface Dict<T> { [key: string]: T };

export interface Position {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

