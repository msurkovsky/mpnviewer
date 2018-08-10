import * as React from 'react';

import * as Utils from './utils';

import {TPlace} from '../netmodel';
import {mpnUnit} from '../types';
import {BoundingBox, ViewElement} from './viewelement';


interface Props {
    place: TPlace;
    bbox: BoundingBox;
    handleMainMove: (dx: number, dy: number) => void;
    handleRelatedMove: (dx: number, dy: number) => void;
    handleResize: (bbox: BoundingBox) => void;
}


interface State {
    placeBbox: BoundingBox;
    typeBbox?: BoundingBox;
    exprBbox?: BoundingBox;
}


class CorePlace extends React.Component<Props, State> {

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
                {this.renderText(bbox, typeBbox)}
                {this.renderText(bbox, exprBbox)}
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
            />
        );
    }

    protected renderText(bbox: BoundingBox, textBbox: BoundingBox | undefined) {
        if (textBbox === undefined) {
            return null;
        }

        return (
            <rect
                {...Utils.absolutizeBouningBoxes(bbox, [textBbox])[0]}
            />
        );
    }
}

export const Place = ViewElement<{place: TPlace}>(CorePlace);
