import * as React from 'react'

import {ViewElement} from './netelement'

/* export type ViewPlaceProps = React.SVGProps<SVGCircleElement>;*/

type color = string;

interface ViewPlaceProps {
    x: number;
    y: number;
    width: number;
    height: number;
    stroke?: color;
    strokeWidth?: number;
    fill?: color;
};

export class Place extends React.Component<ViewPlaceProps, {}> {

    protected static defaultProps = {
        "fill": "#fff",
        "stroke": "#000",
        "strokeWidth": 2,
    };

    public render () {
        const {x, y, width, height} = this.props;

        const rx = width / 2;
        const ry = height / 2;
        const cx = x + rx;
        const cy = y + ry;

        return (
            // NOTE: {x,y} == {x: x, y: y}; this is called property shorthand
            <ViewElement position={{x, y}} size={{width, height}}>
                <circle
                    cx={cx}
                    cy={cy}
                    r={rx/* TODO: use both rx and ry*/}
                    stroke={this.props.stroke}
                    strokeWidth={this.props.strokeWidth}
                    fill={this.props.fill} />
            </ViewElement>
        );
    }
}
