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
    a: Position; // direction/gradient
    u: Vector2d; // magnitude
}

export interface Circle {
    c: Position; // center
    r: number;   // radius
}

