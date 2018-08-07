import * as React from 'react'

import {ViewElement, ViewElemProps} from './netelement'

/* export type ViewPlaceProps = React.SVGProps<SVGCircleElement>;*/

type color = string;

export interface ViewPlaceProps extends ViewElemProps {
    stroke?: color;
    strokeWidth?: number;
    fill?: color;
    onClick?: (e: any) => void;
}

export interface ViewPlaceState extends ViewElemProps {
    relX: number;
    relY: number;
}

export class Place extends React.Component<ViewPlaceProps, ViewPlaceState> {

    protected static defaultProps = {
        "fill": "#fff",
        "stroke": "#000",
        "strokeWidth": 2
    };

    public constructor (props: ViewPlaceProps) {
        super(props);

        const {x, y, width, height} = this.props;

        const bbox = ViewElement.computeBoundingBox([{x, y, width, height}]); // TODO: later on add more inner elements

        this.state = {
            ...bbox,
            relX: bbox.x - x,
            relY: bbox.y - y,
        }
        console.log("BBOX", this.state);
    }

    public render () {
        const {x, y, width, height, relX, relY} = this.state;

        const rx = width / 2;
        const ry = height / 2;

        return (
            <ViewElement {...this.state} >
                <rect {...{x: x+relX, y: y+relY, rx, ry, width, height}} />
            </ViewElement>
        );
    }

    public computeMove (e: any): void {
        console.log("compute move", e);
    }
}
