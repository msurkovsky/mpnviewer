import * as Ramda from 'ramda';
import * as React from 'react';

import {ArcElement, BaseNetElement, isArc, isPlace, isTransition,
        NetCategory, NetElement, NetElementType, NetStructure,
        PlaceElement, TransitionElement} from './netmodel';
import {Arc, Place, Transition} from './netview';
import {BBox, Circle, Dict, ID, Line, Position, Vector2d} from './types';
import {font, FontSetting, FontSize, pt2px} from './visualsetting';

export const emptyFn = () => {/*empty*/};
export const identity = (v: any) => v;

export const getId = ((id: number) => (): string => {
    return (id++).toString();
})(new Date().getTime());

export function computeDefaultRelatedPositions(
    element: BaseNetElement,
    net: NetStructure
): Dict<Position> {

    if (isPlace(element)) {
        const size = (element as PlaceElement).size;
        return {
            dataType: { x: size.width, y: size.height },
            initExpr: {x: size.width, y: 0}
        };
    } else if (isTransition(element)) {
        const size = (element as TransitionElement).size;
        return {guard: {
            x: 0,
            y: size.height + 5 + pt2px(font.code.size.small) / 2,
        }};
    } else if (isArc(element)) {
        const points = getArcPoints(element as ArcElement, net);
        return {
            expression: computePolylineCentroid(points)
        };
    } else {
        throw new Error("Invalid element type");
    }
}

export function fillElementDefaultRelatedPosition(
    element: BaseNetElement,
    net: NetStructure
) {
    const relatedPositions = computeDefaultRelatedPositions(element, net);
    return {...element, relatedPositions};
}

export function fillDefaultRelatedPositions(net: NetStructure) {

    const fill = (n: NetStructure, category: NetCategory) => {
        for (const key of Object.keys(net[category])) {
            const element = net[category][key];

            const path = Ramda.lensPath([category, key]);
            n = Ramda.over(path, ({size, relatedPositions: defined, ...rest}) => {
                const relatedPositions = {...defined};
                const elemDefaultPos = computeDefaultRelatedPositions(element, net);

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

    let newNet: NetStructure = net;

    newNet = fill(newNet, NetCategory.PLACES);
    newNet = fill(newNet, NetCategory.TRANSITIONS);
    newNet = fill(newNet, NetCategory.ARCS);
    return newNet;
}

export function getArcPoints(arc: ArcElement, net: NetStructure): Position[] {

    type PT = PlaceElement | TransitionElement;

    const startElement = Ramda.path(arc.startElementPath, net) as PT;
    const startPoint = computeCenter({...startElement.position, ...startElement.size});

    let endPoint;
    const wArc = arc as any;
    if (wArc.endPosition !== undefined) {
        endPoint = wArc.endPosition;
    } else if (wArc.endElementPath !== undefined) {
        let preLastPoint = startPoint;
        if (arc.innerPoints.length > 0) {
            preLastPoint = arc.innerPoints[arc.innerPoints.length - 1];
        }
        const endElement = Ramda.path(wArc.endElementPath, net) as PT;
        let radius = 0;
        if (isPlace(endElement)) {
            radius = endElement.size.height / 2;
        }
        endPoint = rrectCollision(
            {...endElement.position, ...endElement.size},
            preLastPoint,
            radius);
    } else {
        throw new Error ("Invalid arc!");
    }

    return [startPoint, ...arc.innerPoints, endPoint];
}

export function getArcId(arc: ArcElement, net: NetStructure): string {

    const startElement = Ramda.path(arc.startElementPath, net) as NetElement;

    const wArc = arc as any;

    let endId;
    if (wArc.endElementPath !== undefined) {
        const endElement = Ramda.path(wArc.endElementPath, net) as NetElement;
        endId = endElement.data.id;
    } else {
        endId = "dummyend";
    }

    return `${startElement.data.id}-${endId}`;
}

export function getNetComponet(type: NetElementType) {
    const {ARC, PLACE, TRANSITION} = NetElementType;
    switch (type) {
        case ARC:
            return Arc;
        case PLACE:
            return Place;
        case TRANSITION:
            return Transition;
    }
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

export function rejectNulls (obj: any) {
    const isNull = (v: any): boolean => (v === null);
    return Ramda.reject(isNull, obj) as any;
}

export function undefinedToNulls (obj: any) {
    const toNull = (v: any) => v === undefined ? null : v;
    return Ramda.map(toNull, obj);
}

export function getPositionOnCanvas (
    canvasId: ID,
    evt: React.MouseEvent | MouseEvent
): Position {
    const canvas = document.getElementById(canvasId) as HTMLElement;

    const clientBBox = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - clientBBox.left,
        y: evt.clientY - clientBBox.top,
    };
}

export function computeCenter(bbox: BBox): Position {
    return {
        x: bbox.x + bbox.width / 2,
        y: bbox.y + bbox.height / 2,
    };
}

export function computePolylineCentroid(points: Position[]): Position {
    if (points.length < 2) {
        throw new Error("Polyline hast to have at least two points!");
    }

    let cx = 0, cy = 0;
    let i, j;
    for (i = 0, j = 1; j < points.length; i++, j++) {
        cx += points[i].x + (points[j].x - points[i].x) / 2;
        cy += points[i].y + (points[j].y - points[i].y) / 2;
    }

    const ret =  {
        x: cx / i,
        y: cy / i,
    };
    return ret;
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

export function v2dSub (a: Vector2d, b: Vector2d): Vector2d {
    return { x: a.x - b.x, y: a.y - b.y };
}

export function v2dAdd (a: Vector2d, b: Vector2d): Vector2d {
    return { x: a.x + b.x, y: a.y + b.y };
}

export function v2dScalarMul (s: number, a: Vector2d): Vector2d {
    return { x: s * a.x, y: s * a.y };
}

export function v2dSquare (a: Vector2d): Vector2d {
    return { x: a.x * a.x, y: a.y * a.y };
}

export function v2dAddComponents (a: Vector2d): number {
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
