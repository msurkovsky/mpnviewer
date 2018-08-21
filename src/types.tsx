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

export type BBox = Position & Size;

export type Vector2d = Position;

export interface Line {
    a: Position;
    u: Vector2d;
}

