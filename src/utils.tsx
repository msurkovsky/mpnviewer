import {lensPath, over, path as ramdaPath} from 'ramda'
import * as React from 'react'
import {ArcElement, Net as TNet, NetElement} from './netmodel'
import {BBox, Circle, Line, Position, Size} from './types'
import {FontSetting, FontSize, pt2px} from './visualsetting'

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
    arcs: (startElemSize: Size) => ({
        expression: {x: startElemSize.width + 5, y: startElemSize.height / 2 - 5}
    })
};

export const emptyFn = () => {/*empty*/};
export const identity = (v: any) => v;

export const getId = ((id: number) => (): string => {
    return (id++).toString();
})(new Date().getTime());

export function fillElementDefaultRelatedPosition(element: NetElement, category: string) {
    const relatedPositions = defaultPositions[category](element.size);
    return {...element, relatedPositions};
}

export function fillArcsDefaultRelatedPosition(net: TNet) {

    for (const key of Object.keys(net.arcs)) {
        const path = lensPath(["arcs", key]);
        const arc = ramdaPath(["arcs", key], net) as ArcElement;

        const startElem = ramdaPath(arc.startElementPath, net) as NetElement;
        const arcDefaultPos = defaultPositions.arcs(startElem.size);
        net = over(path, ({relatedPositions: defined, ...rest}) => {
            const relatedPositions = {...defined};

            for (const p of Object.keys(arcDefaultPos)) {
                if (!relatedPositions[p]) {
                    relatedPositions[p] =  arcDefaultPos[p];
                }
            }

            return {...rest, relatedPositions};
        }, net);
    }
    return net;
}

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
    newNet = fillArcsDefaultRelatedPosition(newNet);
    return newNet;
}

export function textToSVG(
    keyPrefix: string,
    text: string,
    fontSetting: FontSetting,
    fontSize: FontSize,
    svgTextAttrs: React.SVGProps<SVGTextElement> = {}
): JSX.Element {

    const {x=0, y=0, textAnchor, alignmentBaseline} = svgTextAttrs;

    const lines = text.split('\\n');
    const tspans = [];

    // font size
    const fsize = fontSetting.size[fontSize];
    // space size
    const spsize = fontSetting.spaceFactor * fsize; // don not apply pt2px here

    let idx = 0;
    let dy = 0;
    for (const line of lines) {
        const spaces = line.search(/\S|$/);
        const tspan =
            <tspan
              fontFamily={fontSetting.face}
              fontWeight={fontSetting.weight}
              fontSize={`${fsize}pt`}
              key={`${keyPrefix}-${idx}`}
              x={x}
              dx={spaces * spsize}
              dy={dy}
              textAnchor={textAnchor}
              alignmentBaseline={alignmentBaseline}>

              {line.trim()}
            </tspan>

        dy = pt2px(fsize * 1.2); // dy is relative to the previous one; first dy has to be zero.
        idx++;
        tspans.push(tspan);
    }

    return (
        <text
            {...svgTextAttrs}
            y={y as number - dy * (idx - 1) / 2
               /*mines half of the line for every new one*/}>

            {tspans}
        </text>
    );
}

export function codeRef2String(v: null | number | [number, number]): string {
    if (v === null) {
        return "";
    }

    if (typeof v === "number") {
        return "" + v;
    }
    return `${v[0]}-${v[1]}`;
}

export function getPosition(evt: React.MouseEvent | MouseEvent): Position {
    return {x: evt.clientX, y: evt.clientY};
}

export function computeCenter(bbox: BBox): Position {
    return {
        x: bbox.x + bbox.width / 2,
        y: bbox.y + bbox.height / 2,
    };
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
    r: number=0,  // radius of bounding box corners
    tolerance: number=3
): Position {

    const c = computeCenter(bbox);
    const l1 = { a: c, u: v2dSub(p, c) };

    const rectLines = [{
        // top line
        a: {x: bbox.x + r, y: bbox.y - tolerance},
        u: {x: bbox.width - 2*r, y: 0} // -2r because the lengh was shortened
                                       // once at the beggining
    },{
        // right line
        a: {x: bbox.x + bbox.width + tolerance, y: bbox.y + r},
        u: {x: 0, y: bbox.height - 2*r}
    },{
        // bottom line
        a: {x: bbox.x + r, y: bbox.y + bbox.height + tolerance},
        u: {x: bbox.width - 2*r, y: 0}
    },{
        // left line
        a: {x: bbox.x - tolerance, y: bbox.y + r},
        u: {x: 0, y: bbox.height - 2*r}
    }];

    const fLLI = linesIntersectGetT(l1); // line-line intersect
    const lineIntersectT = rectLines.map(fLLI);

    let circleIntersectT: Array<number | null> = [];
    if (r > 0) { // compute rounded corners
        const circles = [
            // top-right
            {c: {x: bbox.x + bbox.width - r, y: bbox.y + r},
                r: r + tolerance},
            // bottom-right
            {c: {x: bbox.x + bbox.width - r, y: bbox.y + bbox.height - r},
                r: r + tolerance},
            // bottom-left
            {c: {x: bbox.x + r, y: bbox.y + bbox.height - r},
                r: r + tolerance},
            // top-left
            {c: {x: bbox.x + r, y: bbox.y + r},
                r: r + tolerance}
        ];

        const fLCI = lineCircleIntersectGetT(l1); // line-circle intersect
        circleIntersectT = circles.map(fLCI);
    }

    const t = [...lineIntersectT,
               ...circleIntersectT].filter((v) => v !== null) as number[];
    let resultingT;
    if (t.length > 0) {
        resultingT = Math.max(...t);
    } else {
        resultingT = 0;
    }

    return {x: l1.a.x + l1.u.x * resultingT, y: l1.a.y + l1.u.y * resultingT};
}
