import * as React from 'react'

import {ViewElement, ViewElemProps} from './netelement'

/* export type ViewPlaceProps = React.SVGProps<SVGCircleElement>;*/

type color = string;

export interface ViewPlaceProps extends ViewElemProps {
    stroke?: color;
    strokeWidth?: number;
    fill?: color;
};

export class Place extends React.Component<ViewPlaceProps, {}> {

    protected static defaultProps = {
        "fill": "#fff",
        "stroke": "#000",
        "strokeWidth": 2
    };

    constructor (props: ViewPlaceProps) {
        super(props);

    }

    public render () {
        const {x, y, width, height, ...other} = this.props;

        const rx = width / 2;
        const ry = height / 2;

        return (
            // NOTE: {x,y} == {x: x, y: y}; this is called property shorthand
            <ViewElement {...{x, y, width, height}} >
                <rect {...other} {...{x, y, rx, ry, width, height}} />
            </ViewElement>
        );
    }
}
