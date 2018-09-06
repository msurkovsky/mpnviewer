import {TOOL_AUTO, TOOL_NONE} from 'react-svg-pan-zoom'
import {
    AMT, NetElement, PlaceDataLayout,
    PlaceElement, TransitionElement, UnpositionedNetElement
} from '../netmodel';
import {onMovableMouseDown, onMovableMouseUp} from '../netview/movable'
import {Viewer} from '../netview/net'
import {NetTool} from '../toolbar'
import {Omit} from '../types'
import * as Utils from '../utils';

const {getPositionOnCanvas, v2dScalarMul, v2dSub} = Utils;

export function emptyPlace (): Omit<PlaceElement, "position"> {
    return {
        data: {
            id: Utils.getId(),
            elementType: "place",
            name: "",
            type: AMT.UNIT,
            initExpr: "",
            dataLayout: PlaceDataLayout.QUEUE,
        },
        size: {
            width: 40,
            height: 40
        },
    };
}

export function emptyTransition(): Omit<TransitionElement, "position"> {
    return {
        data: {
            id: Utils.getId(),
            elementType: "transition",
            name: "",
        },
        size: {
            width: 60,
            height: 40,
        },
    };
}

let ctx: {
    addingElement: UnpositionedNetElement;
    viewerInst: Viewer;
    triggerAddNetElement: (elem: NetElement) => void;
    triggerRemoveNetElement: (id: string) => void;
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
    ctx.triggerAddNetElement({...ctx.addingElement, position});

    // pass the control to movable component and remove enter event
    onMovableMouseDown(ctx.addingElement.data.id)(evt);
    ctx.viewerInst.ViewerDOM.removeEventListener("mouseenter", addNetElement);
}

export const startAddingNetElement = (
    viewerInst: Viewer,
    addingElement: UnpositionedNetElement,
    triggerAddNetElement: (elem: NetElement) => void,
    triggerRemoveNetElement: (id: string) => void,
    triggerChangeToolbarTools: (canvasTool: any, netTool: NetTool | null) => void,
) => (evt: React.MouseEvent) => {

    ctx = {addingElement, viewerInst,
           triggerAddNetElement, triggerRemoveNetElement,
           triggerChangeToolbarTools};
    ctx.triggerChangeToolbarTools(TOOL_NONE, null);
    attachEvents();
}

export function endAddingNetElement(evt: React.MouseEvent) {
    onMovableMouseUp(evt);

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
        onMovableMouseUp(evt);
        evt.preventDefault();
    }

    ctx.triggerChangeToolbarTools(TOOL_AUTO, NetTool.NONE);
    ctx.triggerRemoveNetElement(ctx.addingElement.data.id);

    /*
    ctx.triggerChangeNetToolbarValue(null); // TODO: ?
    */
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
