
import {ArcElement, ArcType, NetElement, PartialArcElement} from '../netmodel';
import {Viewer} from '../netview/net';
import {Position} from '../types';
import * as Utils from '../utils';

type AE = ArcElement | PartialArcElement;

let ctx: {
    viewerInst: Viewer,
    partialArc: PartialArcElement,
    triggerAddArc: (arc: AE) => void;
    triggerRemoveArc: (id: string) => void,
    triggerChangeNetToolbarValue: (value: any) => void;
} | null = null;

function normalizePosition(position: Position) {
    const {a: zoom, e: panX, f: panY} = ctx!.viewerInst.state.value;

    return {
        x: (position.x - panX) / zoom,
        y: (position.y - panY) / zoom,
    };
}

function arcEndPointMoving(evt: MouseEvent) {
    if (ctx === null) {
        return;
    }

    const pos = normalizePosition(Utils.getPosition(evt));
    ctx.partialArc.endPosition = pos;
    ctx.triggerAddArc(ctx.partialArc);
}

function arcAddNewEndPoint(evt: React.MouseEvent) {
    if (ctx === null) {
        return;
    }

    const last = ctx.partialArc.endPosition;
    const pos = normalizePosition(Utils.getPosition(evt));
    ctx.partialArc.innerPoints.push({...last});
    ctx.partialArc.endPosition = pos;
    ctx.triggerAddArc(ctx.partialArc);
}

export function startAddingArc(
    viewerInst: Viewer,
    startElement: NetElement,
    path: string[],
    triggerAddArc: (arc: AE) => void,
    triggerRemoveArc: (id: string) => void,
    triggerChangeNetToolbarValue: (value: any) => void
){
    const partialArc = {
        data: {
            id: Utils.getId(),
            expression: "",
            type: ArcType.SINGLE_HEADED
        },
        startElementPath: [...path],
        endPosition: Utils.computeCenter(
            {...startElement.position, ...startElement.size}),
        innerPoints: []
    };

    ctx = {viewerInst, partialArc, triggerAddArc, triggerRemoveArc, triggerChangeNetToolbarValue};
    viewerInst.ViewerDOM.addEventListener("mousemove", arcEndPointMoving);
    viewerInst.ViewerDOM.addEventListener("click", arcAddNewEndPoint);
    viewerInst.ViewerDOM.addEventListener("contextmenu", cancelAddingArc);
    triggerChangeNetToolbarValue({value: {partialArcId: partialArc.data.id}});
}

export function endAddingArc(path: string[]) {
    if (ctx === null) {
        return;
    }

    const {data, startElementPath, innerPoints} = ctx.partialArc;
    const fullArc = {
        data: {
            ...data,
            id: `${data.id}-full` // change id to safely remove
                                  // partial arc after adding the full one
        },
        startElementPath: [...startElementPath],
        // cut off the last element
        innerPoints: innerPoints.splice(0, innerPoints.length-1),
        endElementPath: [...path],
    };
    ctx.triggerAddArc(fullArc);
    cancelAddingArc();
}

export function cancelAddingArc(evt?: React.MouseEvent) {
    if (ctx === null) {
        return;
    }

    if (evt) { // prevent default context menu
        evt.preventDefault();
    }

    ctx.triggerRemoveArc(ctx.partialArc.data.id);

    ctx.triggerChangeNetToolbarValue(null);
    ctx.viewerInst.ViewerDOM.removeEventListener("mousemove", arcEndPointMoving);
    ctx.viewerInst.ViewerDOM.removeEventListener("click", arcAddNewEndPoint);
    ctx.viewerInst.ViewerDOM.removeEventListener("contextmenu", cancelAddingArc);
    // remove context
    ctx = null;
}
