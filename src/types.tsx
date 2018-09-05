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

    public x: number;
    public y: number;

    protected anchorElement: Positionable;

    constructor (anchorElement: Positionable) {
        this.anchorElement = anchorElement;
        this.x = this.getX();
        this.y = this.getY();
    }

    public toJSON?(): RelPosJSON {
        return { id: this.anchorElement.id };
    }

    protected abstract fetch(): Positionable;
    protected abstract getX(): number;
    protected abstract getY(): number;
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

