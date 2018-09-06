import * as Utils from '../utils'

import {PositionChanged} from '../events';
import {Path, Position, Vector2d} from '../types'

let ctx: Position & {
    // TODO: rename
    pointerElementDiff: Vector2d; // diff between mouse pointer and element position
    zoom: number;
    pan: Position;
    positionPath: Path;
    triggerPositionChanged: (evt: PositionChanged) => void; // TODO: create sth. like callback/events types
} | null = null;

const {v2dSub, v2dScalarMul} = Utils;
const handleMoving = (evt: MouseEvent) => {
    if (ctx === null) {
        return;
    }

    evt.stopPropagation();

    const {x, y, pointerElementDiff, zoom, pan,
           positionPath, triggerPositionChanged} = ctx;

    const pos = Utils.getPositionOnCanvas(evt);
    const newPos = v2dSub(
        v2dScalarMul(1/zoom, v2dSub(pos, pan)),
        pointerElementDiff);

    triggerPositionChanged({
        path: positionPath,
        new: newPos,
        old: {x, y},
    });
}

export const startMoving = (
    x: number,
    y: number,
    zoom: number,
    pan: Position,
    positionPath: Path,
    triggerPositionChanged: (evt: PositionChanged) => void
) => (evt: React.MouseEvent) => {

    evt.stopPropagation();

    const pos = Utils.getPositionOnCanvas(evt);
    const pointerElementDiff = v2dSub(
        v2dScalarMul(1/zoom, v2dSub(pos, pan)),
        {x, y});

    ctx = {x, y, pointerElementDiff, zoom, pan,
           positionPath, triggerPositionChanged};

    document.addEventListener('mousemove', handleMoving);
}

export const stopMoving = (e: React.MouseEvent) => {
    if (ctx === null) {
        return;
    }

    e.stopPropagation();

    document.removeEventListener('mousemove', handleMoving);
    ctx = null;
}
