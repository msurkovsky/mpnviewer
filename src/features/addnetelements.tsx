import {TOOL_AUTO, TOOL_NONE} from 'react-svg-pan-zoom'
import {
    AMT, NetElement, PlaceDataLayout,
    PlaceElement, TransitionElement, UnpositionedNetElement
} from '../netmodel';
import {onMovableMouseDown, onMovableMouseUp} from '../netview/movable'
import {NetTool} from '../toolbar'
import {Omit} from '../types'
import {getPositionOnCanvas, v2dScalarMul, v2dSub} from '../utils';
import * as Utils from '../utils';


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

let addingElem: UnpositionedNetElement | null = null;
let triggerAddElement: ((elem: NetElement) => void) | null = null;
let triggerChangeToolbarTools: ((canvasTool: any, netTool: NetTool | null) => void) | null = null;
let viewerInst: {ViewerDOM: any, state: any} | null = null;

const addNetElement = (evt: React.MouseEvent) => {
    if (addingElem === null || triggerAddElement === null || viewerInst === null) {
        // TODO: make one "nullable" element
        return;
    }

    const {e: panX, f: panY, a: zoom} = viewerInst.state.value;
    const {width, height} = addingElem.size;

    const pan = {x: panX, y: panY};

    const mousePosition = getPositionOnCanvas(evt);
    const position = v2dSub(
        v2dScalarMul(1/zoom, v2dSub(mousePosition, pan)),
        {x: width/2, y: height/2});

    // somehow add the element into the net
    triggerAddElement({...addingElem, position});

    // pass the control to movable component and remove enter event
    onMovableMouseDown(addingElem.data.id)(evt);
    viewerInst.ViewerDOM.removeEventListener("mouseenter", addNetElement);
}

export const startAddingNetElement = (
    elem: UnpositionedNetElement,
    viewer: {ViewerDOM: any, state: any},
    onAddElement: (elem: NetElement) => void,
    onChangeToolbarTools: (canvasTool: any, netTool: NetTool | null) => void,
) => (evt: React.MouseEvent) => {

    addingElem = elem;
    viewerInst = viewer;
    triggerAddElement = onAddElement;
    triggerChangeToolbarTools = onChangeToolbarTools;
    triggerChangeToolbarTools(TOOL_NONE, null);
    viewerInst.ViewerDOM.addEventListener("mouseenter", addNetElement)
    viewerInst.ViewerDOM.addEventListener("click", endAddingNetElement);
}

export function endAddingNetElement(evt: React.MouseEvent) {
    onMovableMouseUp(evt);

    if (viewerInst !== null) {
        viewerInst.ViewerDOM.removeEventListener("click", endAddingNetElement);
    }

    if (triggerChangeToolbarTools !== null) {
        triggerChangeToolbarTools(TOOL_AUTO, NetTool.NONE);
        triggerChangeToolbarTools = null;
    }

    addingElem = null;
    viewerInst = null;
    triggerAddElement = null;
}
