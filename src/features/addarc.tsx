import {dissoc} from 'ramda';

import {
    ArcType, BaseNetElement, FullArcElement,
    NetElementType, PartialArcElement
} from '../netmodel';
import {ID, Path, Position, Positionable, Resizable} from '../types';
import * as Utils from '../utils';

type AE = FullArcElement | PartialArcElement;

let ctx: {
    canvasId: ID;
    zoom: number;
    pan: Position;
    partialArc: PartialArcElement;
    addArc: (arc: AE) => void;
    removeArc: (id: string) => void;
    changeNetToolbarValue: (value: any) => void;
} | null = null;

const {v2dSub, v2dScalarMul} = Utils;

const arcAddNewEndPoint = (saveEndPoint: boolean) => (evt: MouseEvent) => {
    if (ctx === null) {
        return;
    }

    const {canvasId, partialArc, zoom, pan, addArc} = ctx;

    if (saveEndPoint) {
        const last = ctx.partialArc.endPosition;
        partialArc.innerPoints.push({...last});
    }

    const pos = Utils.getPositionOnCanvas(canvasId, evt);
    partialArc.endPosition = v2dScalarMul(1/zoom, v2dSub(pos, pan));
    addArc(ctx.partialArc);
}

const addTemporaryEndPoint = arcAddNewEndPoint(true);

const addPermamentEndPoint = arcAddNewEndPoint(false);

export function startAddingArc(
    canvasId: ID,
    zoom: number,
    pan: Position,
    startElement: BaseNetElement & Positionable & Resizable,
    path: Path,
    addArc: (arc: AE) => void,
    removeArc: (id: string) => void,
    changeNetToolbarValue: (value: any) => void
){
    const partialArc: PartialArcElement = {
        data: {
            id: Utils.getId(),
            expression: "",
            type: ArcType.SINGLE_HEADED
        },
        type: NetElementType.ARC,
        startElementPath: [...path],
        endPosition: Utils.computeCenter(
            {...startElement.position, ...startElement.size}),
        innerPoints: []
    };

    ctx = {canvasId, zoom, pan, partialArc,
           addArc, removeArc, changeNetToolbarValue};

    attachEvents();
    changeNetToolbarValue({value: {partialArcId: partialArc.data.id}});
}

export function endAddingArc(path: string[]) {
    if (ctx === null) {
        return;
    }

    const {data, innerPoints, ...rest} = dissoc("endPosition", ctx.partialArc);
    const fullArc = {
        ...rest,
        data: {
            ...data,
            id: `${data.id}-full` // change id to safely remove
                                  // partial arc after adding the full one
        },
        // cut off the last element
        innerPoints: innerPoints.splice(0, innerPoints.length-1),
        endElementPath: [...path],
    } as FullArcElement; // cast type because of '...rest' construct

    ctx.addArc(fullArc);
    cancelAddingArc();
}

export function cancelAddingArc(evt?: MouseEvent) {
    if (ctx === null) {
        return;
    }

    if (evt) { // prevent default context menu
        evt.preventDefault();
    }

    ctx.removeArc(ctx.partialArc.data.id);

    ctx.changeNetToolbarValue(null);

    detachEvents();
    // remove context
    ctx = null;
}

function attachEvents () {
    const canvas = document.getElementById(ctx!.canvasId) as HTMLElement;

    canvas.addEventListener("mousemove", addTemporaryEndPoint);
    canvas.addEventListener("click", addPermamentEndPoint);
    canvas.addEventListener("contextmenu", cancelAddingArc);
}

function detachEvents() {
    const canvas = document.getElementById(ctx!.canvasId) as HTMLElement;

    canvas.removeEventListener("mousemove", addTemporaryEndPoint);
    canvas.removeEventListener("click", addPermamentEndPoint);
    canvas.removeEventListener("contextmenu", cancelAddingArc);
}
