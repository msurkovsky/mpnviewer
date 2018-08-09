import * as React from 'react'

import {BoundingBox, UID} from './types'
import * as Utils from './utils'
import {ViewElement} from './viewelement'

interface PlaceType { // TODO: move into 'model' package
    id: UID
    name: string;
    type: string;
    initExpr: string;
}

interface Props {
    place: PlaceType;
    bbox: BoundingBox;
    handleMainMove: (dx: number, dy: number) => void;
    handleRelatedMove: () => void;
    handleResize: (bbox: BoundingBox) => void;
}

interface State {
    place: PlaceType;
    placeBox: BoundingBox;
    typeBox?: BoundingBox;
    initBox?: BoundingBox;
}

class CorePlace extends React.Component<Props, State> {

    private startX: number | null = null;
    private startY: number | null = null;
    private moving: boolean = false;

    constructor(props: any) {
        super(props);
        const {place, bbox} = this.props;

        const placeBox = {...bbox, x: 0, y: 0};
        const typeBox = {
            height: 2,
            width: 5,
            x: placeBox.width,
            y: placeBox.height,
        };

        this.state = {
            initBox: place.initExpr !== "" ? {x: bbox.width, y: 0, width:30, height: 20} : undefined, // TODO: compute width and height
            place,
            placeBox,
            typeBox: place.type !== "" ? typeBox : undefined,
        }
    }

    public componentDidMount () {
        const bbox = this.props.bbox;
        const {place, ...others} = this.state;

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
        const placeBox = this.state.placeBox;

        const width = placeBox.width;
        const height = placeBox.height;
        const ry = height / 2;
        const rx = ry;

        return (
            <g>
            <rect
                x={bbox.x+placeBox.x}
                y={bbox.y+placeBox.y}
                rx={rx}
                ry={ry}
                width={width}
                height={height}
                onMouseDown={this.handlePlaceMouseDown}
                onMouseMove={this.handlePlaceMouseMove}
                onMouseUp={this.handlePlaceMouseUp}
            />
            </g>
        );
    }

    private handlePlaceMouseDown = (e: any) => {
        this.moving = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
        console.log("down");
    }

    private handlePlaceMouseMove = (e: any) => {
        if (!this.moving) {
            return;
        }

        const cbMove = this.props.handleMainMove;
        if (this.startX !== null && this.startY !== null) {
            cbMove(e.clientX-this.startX, e.clientY-this.startY);
        }
        this.startX = e.clientX;
        this.startY = e.clientY;
    }

    private handlePlaceMouseUp = (e: any) => {
        this.startY = this.startX = null;
        this.moving = false;
    }
}

export const Place = ViewElement<{place: PlaceType}>(CorePlace);
