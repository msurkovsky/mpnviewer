import {TOOL_AUTO, TOOL_NONE} from 'react-svg-pan-zoom'
import {PositionChanged} from '../events';
import {
    AMT, isPlace, isTransition,
    NetElement, PlaceDataLayout
} from '../netmodel';
import {Viewer} from '../netview/net'
import {NetTool} from '../toolbar'
import {Resizable} from '../types'
import * as Utils from '../utils';
import {startMoving, stopMoving} from './move'

const {getPositionOnCanvas, v2dScalarMul, v2dSub} = Utils;

export function emptyPlace (): NetElement & Resizable {
    return {
        data: {
            id: Utils.getId(),
            name: "",
            dataType: AMT.UNIT,
            initExpr: "",
            dataLayout: PlaceDataLayout.QUEUE,
        },
        type: "place",
        size: {
            width: 40,
            height: 40
        },
    };
}

export function emptyTransition(): NetElement & Resizable {
    return {
        data: {
            id: Utils.getId(),
            name: "",
        },
        type: "transition",
        size: {
            width: 60,
            height: 40,
        },
    };
}

let ctx: {
    addingElement: NetElement & Resizable;
    viewerInst: Viewer;
    triggerAddNetElement: (elem: NetElement) => void;
    triggerRemoveNetElement: (id: string) => void;
    triggerPositionChanged: (evt: PositionChanged) => void;
    triggerChangeToolbarTools: (canvasTool: any, netTool: NetTool | null) => void;
} | null = null;

const addNetElement = (evt: React.MouseEvent) => {
    if (ctx === null) {
        return;
    }

    const {e: panX, f: panY, a: zoom} = ctx.viewerInst.state.value;
    const {width, height} = ctx.addingElement.size;

    const pan = {x: panX, y: panY};

    const mousePosition = getPositionOnCanvas(evt);
    const position = v2dSub(
        v2dScalarMul(1/zoom, v2dSub(mousePosition, pan)),
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
    startMoving(x, y, zoom, pan, posPath, ctx.triggerPositionChanged)(evt);
    ctx.viewerInst.ViewerDOM.removeEventListener("mouseenter", addNetElement);
}

export const startAddingNetElement = (
    viewerInst: Viewer,
    addingElement: NetElement & Resizable,
    triggerAddNetElement: (elem: NetElement) => void,
    triggerRemoveNetElement: (id: string) => void,
    triggerPositionChanged: (evt: PositionChanged) => void,
    triggerChangeToolbarTools: (canvasTool: any, netTool: NetTool | null) => void,
) => (evt: React.MouseEvent) => {

    ctx = {addingElement, viewerInst,
           triggerAddNetElement, triggerRemoveNetElement,
           triggerPositionChanged, triggerChangeToolbarTools};
    ctx.triggerChangeToolbarTools(TOOL_NONE, null);
    attachEvents();
}

export function endAddingNetElement(evt: React.MouseEvent) {
    if (ctx === null) {
        return;
    }

    ctx.triggerChangeToolbarTools(TOOL_AUTO, NetTool.NONE);
    detachEvents();
    ctx = null;
}

export function cancelAddingNetElement(evt?: React.MouseEvent) {

    if (ctx === null) {
        return;
    }

    if (evt) {
        stopMoving(evt);
        evt.preventDefault();
    }

    ctx.triggerChangeToolbarTools(TOOL_AUTO, NetTool.NONE);
    ctx.triggerRemoveNetElement(ctx.addingElement.data.id);

    detachEvents();
    ctx = null;
}

function attachEvents () {
    if (ctx === null) {
        return;
    }

    ctx.viewerInst.ViewerDOM.addEventListener("mouseenter", addNetElement)
    ctx.viewerInst.ViewerDOM.addEventListener("click", endAddingNetElement);
    ctx.viewerInst.ViewerDOM.addEventListener("contextmenu", cancelAddingNetElement);
}

function detachEvents () {
    if (ctx === null) {
        return;
    }

    ctx.viewerInst.ViewerDOM.removeEventListener("mouseenter", addNetElement)
    ctx.viewerInst.ViewerDOM.removeEventListener("click", endAddingNetElement);
    ctx.viewerInst.ViewerDOM.removeEventListener("contextmenu", cancelAddingNetElement);
}
