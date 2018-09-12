import * as Utils from '../utils'

import {PositionChanged} from '../events';
import {ID, Path, Position, Vector2d} from '../types'

let ctx: {
    canvasId: ID;
    zoom: number;
    pan: Position;
    pointerElementDiff: Vector2d; // diff between mouse pointer and element position
    positionPath: Path;
    triggerPositionChanged: (evt: PositionChanged) => void; // TODO: create sth. like callback/events types
} | null = null;

const {v2dSub, v2dScalarMul} = Utils;

const handleMoving = (evt: MouseEvent) => {
    if (ctx === null) {
        return;
    }

    evt.stopPropagation();

    const {pointerElementDiff, zoom, pan,
           positionPath, triggerPositionChanged} = ctx;

    const pos = Utils.getPositionOnCanvas(ctx.canvasId, evt);
    const newPos = v2dSub(
        v2dScalarMul(1/zoom, v2dSub(pos, pan)),
        pointerElementDiff);

    triggerPositionChanged({
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
    triggerPositionChanged: (evt: PositionChanged) => void
) => (evt: MouseEvent) => {

    evt.stopPropagation();

    const pos = Utils.getPositionOnCanvas(canvasId, evt);
    const pointerElementDiff = v2dSub(
        v2dScalarMul(1/zoom, v2dSub(pos, pan)),
        {x, y});

    ctx = {canvasId, pointerElementDiff, zoom, pan,
           positionPath, triggerPositionChanged};

    document.addEventListener('mousemove', handleMoving);
}

export const stopMoving = (evt: MouseEvent) => {
    if (ctx === null) {
        return;
    }

    evt.stopPropagation();

    document.removeEventListener('mousemove', handleMoving);
    ctx = null;
}
