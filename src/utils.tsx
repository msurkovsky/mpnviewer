import {lensPath, over} from 'ramda'
import {Net as TNet} from './netmodel'
import {BBox, Circle, Line, Position, Size} from './types'

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


export function floatLt (v: number, a: number, e: number = 0.000001): boolean {
    return v < (a + e);
}

export function floatGt (v: number, a: number, e: number = 0.000001): boolean {
    return v > (a - e);
}

export function floatCheckBound (
    v: number, a: number, b: number, e: number = 0.000001
): boolean {
    return floatGt(v, a, e) && floatLt(v, b, e);
}

export function v2dSub (a: Position, b: Position): Position {
    return { x: a.x - b.x, y: a.y - b.y };
}

export function v2dAdd (a: Position, b: Position): Position {
    return { x: a.x + b.x, y: a.y + b.y };
}

export function v2dSquare (a: Position): Position {
    return { x: a.x * a.x, y: a.y * a.y };
}

export function v2dAddComponents (a: Position): number {
    return a.x + a.y;
}

export const linesIntersectGetT = (l1: Line) => (l2: Line): number | null => {

    const d = l2.u.x * l1.u.y - l2.u.y * l1.u.x;
    if (floatLt(Math.abs(d), 0)) {
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

export const lineCircleIntersectGetT = (l: Line) => (circle: Circle): number | null => {
    const {c: center, r: radius} = circle;
    const a = v2dAddComponents(v2dSquare(l.u));
    const b = 2 * (l.a.x * l.u.x + l.a.y * l.u.y -
                   center.x * l.u.x -
                   center.y * l.u.y);
    const c = v2dAddComponents(v2dSquare(center)) -
              radius*radius -
              2 * l.a.x * center.x -
              2 * l.a.y * center.y +
              v2dAddComponents(v2dSquare(l.a));
    const d = b*b - 4*a*c;

    if (floatLt(d, 0)) {
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

    const c = {
        x: bbox.x + bbox.width/2,
        y: bbox.y + bbox.height/2,
    };

    const l1 = { a: c, u: v2dSub(p, c) };

    const rectLines = [{
        a: {x: bbox.x + r, y: bbox.y},
        u: {x: bbox.width - r, y: 0}
    },{
        a: {x: bbox.x + bbox.width, y: bbox.y + r},
        u: {x: 0, y: bbox.height - r}
    },{
        a: {x: bbox.x + r, y: bbox.y + bbox.height},
        u: {x: bbox.width - r, y: 0}
    },{
        a: {x: bbox.x, y: bbox.y + r},
        u: {x: 0, y: bbox.height - r}
    }];

    const fLLI = linesIntersectGetT(l1); // line-line intersect
    const lineIntersectT = rectLines.map(fLLI);

    let circleIntersectT: Array<number | null> = [];
    if (r > 0) { // compute rounded corners
        if (bbox.width === bbox.height && r === (bbox.width / 2)) { // circle
            circleIntersectT = [1 / Math.sqrt(l1.u.x * l1.u.x + l1.u.y * l1.u.y)];
        } else { // rounded rectangle
            const circles: Circle[] = [
                // top-right
                {c: {x: bbox.x + bbox.width - r, y: bbox.y + r}, r},
                // bottom-right
                {c: {x: bbox.x + bbox.width - r, y: bbox.y + bbox.height - r}, r},
                // bottom-left
                {c: {x: bbox.x + r, y: bbox.y + bbox.height - r}, r},
                // top-left
                {c: {x: bbox.x + r, y: bbox.y + r}, r}
            ];

            const fLCI = lineCircleIntersectGetT(l1); // line-circle intersect
            circleIntersectT = circles.map(fLCI);
        }
    }

    const t = [...lineIntersectT,
               ...circleIntersectT].filter((v) => v !== null) as number[];
    let resultingT;
    if (t.length > 0) {
        resultingT = Math.max(...t);
        console.log(t, resultingT);
    } else {
        resultingT = 0;
    }

    return {x: l1.a.x + l1.u.x * resultingT, y: l1.a.y + l1.u.y * resultingT};
}
