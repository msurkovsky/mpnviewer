import {lensPath, over} from 'ramda'
import {Net as TNet} from './netmodel'
import {BBox, Position, Size} from './types'

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

export function lineIntersectGetT(
    p1: Position, p2: Position, p3: Position, p4: Position
): number | null {

    const u1 = {x: p2.x - p1.x, y: p2.y - p1.y};
    const u2 = {x: p4.x - p3.x, y: p4.y - p3.y};

    const d = u2.x * u1.y - u2.y * u1.x;
    if (Math.abs(d) < 0.000001) {
        return null;
    }
    const z = p3.y * u1.x - p1.y * u1.x - p3.x * u1.y + p1.x * u1.y;
    const s = z / d;

    if (s < -0.000001 || s > 1.000001) {
        return null;
    }

    let t;
    if (Math.abs(u1.y) > Math.abs(u1.x)) {
        t = (p3.y - p1.y + u2.y * s) / u1.y;
    } else {
        t = (p3.x - p1.x + u2.x * s) / u1.x;
    }

    if (t < -0.000001 || t > 1.000001) {
        return null;
    }

    return t;
}

export function circleCollision(
    p1: Position,
    p2: Position,
    center: Position,
    radius: number
): number | null {
    const u = {x: p2.x - p1.x, y: p2.y - p1.y};
    const a = u.x * u.x + u.y * u.y;
    const b = 2 * (p1.x * u.x + p1.y * u.y - center.x * u.x - center.y * u.y);
    const c = center.x*center.x + center.y*center.y
            - radius*radius - 2*p1.x*center.x - 2*p1.y*center.y + p1.x*p1.x + p1.y*p1.y;
    const d = b*b - 4*a*c;

    if (d < 0.000001) {
        return null;
    }

    const t1 = (-b+Math.sqrt(d))/(2*a);
    const t2 = (-b-Math.sqrt(d))/(2*a);


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

    const ta = lineIntersectGetT(
        c, p,
        {x: bbox.x + r, y: bbox.y},
        {x: bbox.x + bbox.width - r, y: bbox.y});
    if (ta) {
        t.push(ta);
    }

    const tb = lineIntersectGetT(
        c, p,
        {x: bbox.x + bbox.width, y: bbox.y + r},
        {x: bbox.x + bbox.width, y: bbox.y + bbox.height - r});
    if (tb) {
        t.push(tb);
    }

    const tc = lineIntersectGetT(
        c, p,
        {x: bbox.x + r, y: bbox.y + bbox.height},
        {x: bbox.x + bbox.width - r, y: bbox.y + bbox.height});
    if (tc) {
        t.push(tc);
    }

    const td = lineIntersectGetT(
        c, p,
        {x: bbox.x, y: bbox.y + r},
        {x: bbox.x, y: bbox.y + bbox.height - r});
    if (td) {
        t.push(td);
    }

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
