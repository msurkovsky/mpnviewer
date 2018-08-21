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

export function floatCheckBound (
    v: number, a: number, b: number, e: number = 0.000001
): boolean {
    return (v > (a - e) && v < (b + e));
}

export const linesIntersectGetT = (l1: Line) => (l2: Line): number | null => {

    const d = l2.u.x * l1.u.y - l2.u.y * l1.u.x;
    if (Math.abs(d) < 0.000001) {
        return null;
    }

    const z = l2.a.y * l1.u.x - l1.a.y * l1.u.x +
              l1.a.x * l1.u.y - l2.a.x * l1.u.y;
    const s = z / d;

    if (!floatCheckBound(s, 0, 1)) {
        return null;
    }

    let t;
    if (Math.abs(l1.u.y) > Math.abs(l1.u.x)) {
        t = (l2.a.y - l1.a.y + l2.u.y * s) / l1.u.y;
    } else {
        t = (l2.a.x - l1.a.x + l2.u.x * s) / l1.u.x;
    }

    if (!floatCheckBound(t, 0, 1)) {
        return null;
    }

    return t;
}

export function lineCircleIntersectGetT(
    l: Line,
    center: Position,
    radius: number
): number | null {
    const a = l.u.x * l.u.x + l.u.y * l.u.y;
    const b = 2 * (l.a.x * l.u.x + l.a.y * l.u.y -
                   center.x * l.u.x -
                   center.y * l.u.y);
    const c = center.x * center.x + center.y * center.y -
              radius*radius -
              2 * l.a.x * center.x -
              2 * l.a.y * center.y +
              l.a.x * l.a.x + l.a.y * l.a.y;
    const d = b*b - 4*a*c;

    if (d < 0.000001) {
        return null;
    }

    const t1 = (-b + Math.sqrt(d))/(2 * a);
    const t2 = (-b - Math.sqrt(d))/(2 * a);


    let t = null;
    if (floatCheckBound(t2, 0, 1)) {
        t = t2;
    }

    if (floatCheckBound(t1, 0, 1)) {
        if (t === null || t1 > t) {
            t = t1;
        }
    }

    return t;
}

export function rrectCollision ( // rounded rectangle collision
    bbox: BBox,  // bounding box
    p: Position, // position outer of bbox
    r: number=0  // radius of bounding box corners
): Position {

    console.log(bbox, p, r);
    const c = {
        x: bbox.x + bbox.width/2,
        y: bbox.y + bbox.height/2,
    };

    const u = {
        x: p.x - c.x,
        y: p.y - c.y
    };

    const t = [];

    const l1 = {
        a: c,
        u: {x: p.x - c.x, y: p.y - c.y}
    };

    const rectLines = [

        // TODO: add rect lines
    ];

    const l2a = {
        a: {x: bbox.x + r, y: bbox.y},
        u: {x: bbox.width - r, y: 0}
    };
    t.push(linesIntersectGetT(l1)(l2a));

    const l2b = {
        a: {x: bbox.x + bbox.width, y: bbox.y + r},
        u: {x: 0, y: bbox.height - r}
    };
    t.push(linesIntersectGetT(l1)(l2b));

    const l2c = {
        a: {x: bbox.x + r, y: bbox.y + bbox.height},
        u: {x: bbox.width - r, y: 0}
    };
    t.push(linesIntersectGetT(l1)(l2c));

    const l2d = {
        a: {x: bbox.x, y: bbox.y + r},
        u: {x: 0, y: bbox.height - r}
    };
    t.push(linesIntersectGetT(l1)(l2d));

    if (r > 0) { // compute rounded corners
        if (bbox.width === bbox.height && r === (bbox.width / 2)) { // circle
            t.push(1 / Math.sqrt(u.x * u.x + u.y * u.y));
        } else { // rounded rectangle
            // top-right circle
            const tra = circleCollision(
                c, p,
                {x: bbox.x + bbox.width - r, y: bbox.y + r},
                r);
            if (tra) {
                t.push(tra);
            }

            // bottom-right circle
            const trb = circleCollision(
                c, p,
                {x: bbox.x + bbox.width - r, y: bbox.y + bbox.height - r},
                r);
            if (trb) {
                t.push(trb);
            }

            // bottom-left circle
            const trc = circleCollision(
                c, p,
                {x: bbox.x + r, y: bbox.y + bbox.height - r},
                r);
            if (trc) {
                t.push(trc);
            }

            // top-left circle
            const trd = circleCollision(c, p, {x: bbox.x + r, y: bbox.y + r}, r);
            if (trd) {
                t.push(trd);
            }
        }
    }

    let resultingT;
    if (t.length > 0) {
        resultingT = Math.max(...t);
        console.log(t, resultingT);
    } else {
        resultingT = 0;
    }

    return {x: c.x + u.x * resultingT, y: c.y + u.y * resultingT};
}
