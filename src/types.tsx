export interface Dict<T> { [key: string]: T };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface Position {
    x: number;
    y: number;
}

export interface RelPosJSON {
    id: string;
}

export interface Size {
    width: number;
    height: number;
}

export type Positionable = Position & Size & RelPosJSON;

export abstract class RelativePosition {

    protected anchorElement: Positionable;

    constructor (anchorElement: Positionable) {
        this.anchorElement = anchorElement;
    }

    public toJSON?(): RelPosJSON {
        return { id: this.anchorElement.id };
    }

    protected abstract fetch(): Positionable;
    protected abstract get x(): number;
    protected abstract get y(): number;
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

