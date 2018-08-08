import * as React from 'react'

import {ViewElement} from './viewelement'
import {BoundingBox, UID} from './types'

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
    bbox: BoundingBox;
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
        this.state = {
            bbox: this.props.bbox,
            placeBox: {...this.props.bbox, x: 0, y: 0}
        }
    }

    public componentDidMount () {
        const {bbox, placeBox, typeBox, initBox} = this.state;
        const newBbox = [placeBox, typeBox, initBox]
                            .filter((e) => e !== undefined)
                            .reduce((a: NonNullable<BoundingBox>, b: NonNullable<BoundingBox>) => {
                                return {
                                    x: a.x < b.x ? a.x : b.x,
                                    y: a.y < b.y ? a.y : b.y,
                                    width: a.x + a.width < b.x + b.width ? a.x + a.width : b.x + b.width,
                                    height: a.y + a.height < b.y + b.height ? a.y + a.height : b.y + b.height,
                                }
                            }, bbox);

        this.props.handleResize(newBbox!);
    }

    public render () {
        const {bbox, placeBox} = this.state;

        const width = placeBox.width;
        const height = placeBox.height;
        const rx = width / 2;
        const ry = height / 2;

        return (
            <g>
            <rect
                x={bbox.x+placeBox.y}
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

export const Place = ViewElement(CorePlace, undefined);
