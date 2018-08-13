import * as React from 'react';

import * as Utils from './utils';

import {TPlace} from '../netmodel';
import {mpnUnit} from '../types';
import {BoundingBox, createViewElement} from './viewelement';


interface Props {
    place: TPlace;
    bbox: BoundingBox;
    handleGroupMove: (dx: number, dy: number) => void;
    handleIndividualMove: (dx: number, dy: number) => void;
    handleResize: (bbox: BoundingBox) => void;
}


interface State {
    placeBbox: BoundingBox;
    typeBbox?: BoundingBox;
    exprBbox?: BoundingBox;
}


class CorePlace extends React.Component<Props, State> {

    private origin: {
        coords: {x: number, y: number},
        bbox: BoundingBox
    } | null = null;

    constructor(props: any) {
        super(props);
        const {place, bbox} = this.props;

        const placeBbox = {...bbox, x: 0, y: 0};
        // TODO: compute width and height of the following bbox based on texts
        const exprBbox = {
            x: placeBbox.width,
            y: 0,
            width: 30,
            height: 20,
        };
        const typeBbox = {
            x: placeBbox.width,
            y: placeBbox.height,
            width: 30,
            height: 20,
        };

        this.state = {
            placeBbox,
            exprBbox: place.initExpr.isEmpty() ? exprBbox : undefined,
            typeBbox: place.type !== mpnUnit ? typeBbox : undefined,
        }
    }

    public componentDidMount () {
        const bbox = this.props.bbox;
        const {...others} = this.state;

        // take only valid boxes as a list
        const boxes = Object.keys(others)
                            .map(key => others[key])
                            .filter(b => b !== undefined);

        // The positions of boxes are relative to the provided bounding box `bbox`.
        // To compute bounding box correctly all of them have to abosolutized.
        const absBoxes = Utils.absolutizeBouningBoxes(bbox, boxes);
        const newBbox = Utils.computeBoundingBox(bbox, absBoxes);

        // propagate the new bounding box to the parrent
        this.props.handleResize(newBbox);
    }

    public render () {
        const bbox = this.props.bbox;
        const {placeBbox, typeBbox, exprBbox} = this.state;

        return (
            <g>
                {this.renderPlace(bbox, placeBbox)}
                {this.renderText(bbox, "typeBbox", typeBbox)} {/* TODO: I dont need reference in case of using keys. */}
                {this.renderText(bbox, "exprBbox", exprBbox)}
            </g>
        );
    }

    protected renderPlace(bbox: BoundingBox, placeBbox: BoundingBox) {
        const radius = placeBbox.height / 2;

        return (
            <rect
                {...Utils.absolutizeBouningBoxes(bbox, [placeBbox])[0]}
                rx={radius}
                ry={radius}
                onMouseDown={this.handleMouseDown(this.handleGroupMouseMove, placeBbox)}
                onMouseUp={this.handleMouseUp(this.handleGroupMouseMove)}
            />
        );
    }

    protected renderText(bbox: BoundingBox, name: string, textBbox: BoundingBox | undefined) {
        if (textBbox === undefined) {
            return null;
        }

        const handler = this.handleIndividualMouseMove(name);
        const mouseUp = (e: any) => { // TODO: refactore this method

            if (this.origin === null) {
                throw new Error("unexpected null setting");
            }

            // copy the last state, i.e., bounding boxes of inner elements
            const s = {...this.state}
            // filter unused bboxes
            const bboxes = Object.keys(s).filter(el => s[el] !== undefined).map(key => ({...s[key]}));
            // compute a new bonding box; the absolute one is 0th bbox, because all inner elements are relative,
            // therefore it is possible to work with bounding box as they are
            const newBbox = Utils.computeBoundingBox({x: 0, y: 0, width: 0, height: 0}, bboxes);

            // compute minimal bounding x, y coordinates
            let minX = Number.MAX_VALUE;
            let minY = Number.MAX_VALUE;
            for (const box of bboxes) {
                if (box.x < minX) {
                    minX = box.x;
                }
                if (box.y < minY) {
                    minY = box.y;
                }
            }

            // Modify current bounding boxes of inner elements
            // substract minimal value; two cases:
            //  1. negative - then the difference is actually added to the relative cooridantes.
            //  2. positive - there is empty gap between (0, 0) and first minimal coordinate, by this is cut.
            for (const key in s) {
                if (s[key] !== undefined) {
                    s[key].x -= minX;
                    s[key].y -= minY;
                }
            }

            // in the case th min value is positive the size of overall bbox is reduced (removed empty gap)
            // and coordinates are shifted about this empty gap
            if (minX > 0) {
                newBbox.width -= minX;
                newBbox.x += minX;
            }
            if (minY > 0) {
                newBbox.height -= minY;
                newBbox.y += minY;
            }

            // call the original mouse up handler
            this.handleMouseUp(handler)(e);

            // propagate a new bounding box to the parent component
            this.props.handleResize({
                x: this.props.bbox.x + newBbox.x,
                y: this.props.bbox.y + newBbox.y,
                width: newBbox.width,
                height: newBbox.height,
            });

            // set the new state, i.e. updated bounding boxes
            this.setState(s);
        }

        return (
            <rect
                {...Utils.absolutizeBouningBoxes(bbox, [textBbox])[0]}
                onMouseDown={this.handleMouseDown(handler, textBbox)}
                onMouseUp={mouseUp}
            />
        );
    }

    protected handleGroupMouseMove = (e: MouseEvent) => {
        if (this.origin === null) {
            return;
        }

        const dx = e.pageX - this.origin.coords.x;
        const dy = e.pageY - this.origin.coords.y;

        this.origin.coords.x = e.pageX;
        this.origin.coords.y = e.pageY;

        this.props.handleGroupMove(dx, dy);
    }

    protected handleIndividualMouseMove = (bboxName: string) => (e: any) => {
        if (this.origin === null) {
            return;
        }

        const dx = e.pageX - this.origin.coords.x;
        const dy = e.pageY - this.origin.coords.y;

        this.origin.coords.x = e.pageX;
        this.origin.coords.y = e.pageY;

        const currentBoxes = {...this.state};
        currentBoxes[bboxName].x = currentBoxes[bboxName].x + dx;
        currentBoxes[bboxName].y = currentBoxes[bboxName].y + dy;

        // move with current element
        this.setState(currentBoxes); // TODO: use better identifier
    }

    protected handleMouseDown = (handler: (e: any) => void, originBbox: BoundingBox) => (e: any) => {
        this.origin = {
            coords: {
                x: e.pageX,
                y: e.pageY,
            },
            bbox: {...originBbox}
        };
        document.addEventListener('mousemove', handler);
    }

    protected handleMouseUp = (handler: (e: any) => void) => (e: any) => {
        this.origin = null;
        document.removeEventListener('mousemove', handler);
    }
}

export const Place = createViewElement<{place: TPlace}>(CorePlace);
