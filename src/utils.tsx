import {lensPath, over} from 'ramda'
import {Net as TNet} from './netmodel'
import {BBox, Line, Position, Size} from './types'

const defaultPositions = {
    places: (placeSize: Size) => ({
        "type": {x: placeSize.width, y: placeSize.height},
        "initExpr": {x: placeSize.width, y: 0},
    }),
    transitions: (transSize: Size) => ({
        guard: {x: 0, y: -5} // TODO: transSize.height + 5 -> align at bottom of transition
                             //       but have to find out how to propagate (anonymously)
                             //       other parameters to SVG elements from HOC
    }),
};

export const getId = ((id: number) => (): string => {
    return (id++).toString();
})(0);


export function fillDefaultRelatedPositions(net: TNet) {

    const fill = (n: TNet, elem: string) => {
        for (const key of Object.keys(net[elem])) {
            const path = lensPath([elem, key]);

            n = over(path, ({size, relatedPositions: defined, ...rest}) => {
                const relatedPositions = {...defined};
                const elemDefaultPos = defaultPositions[elem](size);

                for (const p of Object.keys(elemDefaultPos)) {
                    if (!relatedPositions[p]) {
                        relatedPositions[p] =  elemDefaultPos[p];
                    }
                }

                return {...rest, size, relatedPositions};
            }, n);
        }

        return n;
    };

    let newNet: TNet = net;

    newNet = fill(newNet, "places");
    newNet = fill(newNet, "transitions");
    return newNet;
}

export function computeLine(p1: Position, p2: Position): Line {
    const vx = p2.x - p1.x;
    const vy = p2.y - p1.y;

    // normed vector
    const nx = -vy;
    const ny = vx;

    return {
        a: nx,
        b: ny,
        c: - (nx * p1.x + ny * p1.y)
    };
}

export function computeIntersection (bbox: BBox,
                                     p: Position,
                                     rx: number=0,
                                     ry: number=0) {

    const c = {
        x: bbox.x + bbox.width/2,
        y: bbox.y + bbox.height/2,
    };

    // first line center to the given point
    const l1 = computeLine(c, p);

    // TODO: continue here; pick the right edge and compute intersection
}
