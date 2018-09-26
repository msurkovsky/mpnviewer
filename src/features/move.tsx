import * as Utils from '../utils'

import {PositionChanged} from '../events';
import {ID, Path, Position, Vector2d} from '../types'

let ctx: {
    canvasId: ID;
    zoom: number;
    pan: Position;
    pointerElementDiff: Vector2d; // diff between mouse pointer and element position
    positionPath: Path;
    changePosition: (evt: PositionChanged) => void;
} | null = null;

const {v2dSub, v2dScalarMul} = Utils;

const handleMoving = (evt: MouseEvent) => {
    if (ctx === null) {
        return;
    }

    const {pointerElementDiff, zoom, pan,
           positionPath, changePosition} = ctx;

    const pos = Utils.getPositionOnCanvas(ctx.canvasId, evt);
    const newPos = v2dSub(
        v2dScalarMul(1/zoom, v2dSub(pos, pan)),
        pointerElementDiff);

    changePosition({
        path: positionPath,
        value: newPos,
    });
}

export const startMoving = (
    canvasId: ID,
    x: number,
    y: number,
    zoom: number,
    pan: Position,
    positionPath: Path,
    changePosition: (evt: PositionChanged) => void
) => (evt: MouseEvent) => {

    const pos = Utils.getPositionOnCanvas(canvasId, evt);
    const pointerElementDiff = v2dSub(
        v2dScalarMul(1/zoom, v2dSub(pos, pan)),
        {x, y});

    ctx = {canvasId, pointerElementDiff, zoom, pan,
           positionPath, changePosition};

    document.addEventListener('mousemove', handleMoving);
}

export const stopMoving = (evt: MouseEvent) => {
    if (ctx === null) {
        return;
    }

    document.removeEventListener('mousemove', handleMoving);
    ctx = null;
}
