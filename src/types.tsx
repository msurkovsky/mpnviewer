
export interface Dict<T> { [key: string]: T };

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type Path = string[];

export interface Position {
    x: number;
    y: number;
}

export interface Positionable {
    position: Position;
}

export interface Resizable {
    size: Size;
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
