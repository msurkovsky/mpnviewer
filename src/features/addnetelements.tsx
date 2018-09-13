import {TOOL_AUTO, TOOL_NONE} from 'react-svg-pan-zoom'
import {PositionChanged} from '../events';
import {
    AMT, BaseNetElement, isPlace, isTransition,
    NetElement, NetElementType, PlaceDataLayout
} from '../netmodel';
import {NetTool} from '../toolbar'
import {ID, Position, Resizable} from '../types'
import * as Utils from '../utils';
import {startMoving, stopMoving} from './move'

const {getPositionOnCanvas, v2dScalarMul, v2dSub} = Utils;

export function emptyPlace (): BaseNetElement & Resizable {
    return {
        data: {
            id: Utils.getId(),
            name: "",
            dataType: AMT.UNIT,
            initExpr: "",
            dataLayout: PlaceDataLayout.QUEUE,
        },
        type: NetElementType.PLACE,
        size: {
            width: 40,
            height: 40
        },
    };
}

export function emptyTransition(): BaseNetElement & Resizable {
    return {
        data: {
            id: Utils.getId(),
            name: "",
        },
        type: NetElementType.TRANSITION,
        size: {
            width: 60,
            height: 40,
        },
    };
}

let ctx: {
    canvasId: ID;
    zoom: number;
    pan: Position;
    addingElement: BaseNetElement & Resizable;
    triggerAddNetElement: (elem: NetElement) => void;
    triggerRemoveNetElement: (id: string) => void;
    triggerPositionChanged: (evt: PositionChanged) => void;
    triggerChangeToolbarsTool: (canvasTool: any, netTool: NetTool | null) => void;
} | null = null;

const addNetElement = (evt: MouseEvent) => {
    if (ctx === null) {
        return;
    }

    const {width, height} = ctx.addingElement.size;

    const mousePosition = getPositionOnCanvas(ctx.canvasId, evt);
    const position = v2dSub(
        v2dScalarMul(1/ctx.zoom, v2dSub(mousePosition, ctx.pan)),
        {x: width/2, y: height/2});

    // somehow add the element into the net
    const elem = {...ctx.addingElement, position};
    ctx.triggerAddNetElement(elem);

    // pass the control to movable component and remove enter event
    let posPath;

    if (isPlace(elem)) {
        posPath = ["places", elem.data.id, "position"];
    } else if (isTransition(elem)) {
        posPath = ["transitions", elem.data.id, "position"];
    } else {
        throw new Error("invalid element");
    }
    const {x, y} = position;
    startMoving(
        ctx.canvasId,
        x, y,
        ctx.zoom,
        ctx.pan,
        posPath,
        ctx.triggerPositionChanged)(evt);

    const canvas = document.getElementById(ctx.canvasId) as HTMLElement;
    canvas.removeEventListener("mouseenter", addNetElement);
}

export const startAddingNetElement = (
    canvasId: ID,
    zoom: number,
    pan: Position,
    addingElement: BaseNetElement & Resizable,
    triggerAddNetElement: (elem: NetElement) => void,
    triggerRemoveNetElement: (id: string) => void,
    triggerPositionChanged: (evt: PositionChanged) => void,
    triggerChangeToolbarsTool: (canvasTool: any, netTool: NetTool | null) => void,
) => (evt: React.MouseEvent) => {

    ctx = {canvasId, addingElement, zoom, pan,
           triggerAddNetElement, triggerRemoveNetElement,
           triggerPositionChanged, triggerChangeToolbarsTool};

    triggerChangeToolbarsTool(TOOL_NONE, null);
    attachEvents();
}

export function endAddingNetElement(evt: MouseEvent) {
    if (ctx === null) {
        return;
    }

    ctx.triggerChangeToolbarsTool(TOOL_AUTO, NetTool.NONE);
    detachEvents();
    ctx = null;
}

export function cancelAddingNetElement(evt?: MouseEvent) {

    if (ctx === null) {
        return;
    }

    if (evt) {
        stopMoving(evt);
        evt.preventDefault();
    }

    ctx.triggerChangeToolbarsTool(TOOL_AUTO, NetTool.NONE);
    ctx.triggerRemoveNetElement(ctx.addingElement.data.id);

    detachEvents();
    ctx = null;
}

function attachEvents () {
    if (ctx === null) {
        return;
    }

    const canvas = document.getElementById(ctx.canvasId) as HTMLElement;
    canvas.addEventListener("mouseenter", addNetElement)
    canvas.addEventListener("click", endAddingNetElement);
    canvas.addEventListener("contextmenu", cancelAddingNetElement);
}

function detachEvents () {
    if (ctx === null) {
        return;
    }

    const canvas = document.getElementById(ctx.canvasId) as HTMLElement;
    canvas.removeEventListener("mouseenter", addNetElement)
    canvas.removeEventListener("click", endAddingNetElement);
    canvas.removeEventListener("contextmenu", cancelAddingNetElement);
}
