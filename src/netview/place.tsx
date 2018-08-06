import * as React from 'react'

import {ViewElement} from './netelement'

/* export type ViewPlaceProps = React.SVGProps<SVGCircleElement>;*/

interface ViewPlaceProps extends React.SVGProps<SVGCircleElement> {
    cx: number;
    cy: number;
    r: number;
};

export class Place extends React.Component<ViewPlaceProps, {}> {

    protected static defaultProps = {
        "fill": "#fff",
        "stroke": "#000",
        "strokeWidth": 2,
    };

    public render () {
        const {cx, cy, r} = this.props;
        const position = {
            x: cx - r,
            y: cy - r,
        };

        const size = {
            height: 2 * r,
            width: 2 * r,
        };

        return (
            <ViewElement position={position} size={size}>
                <circle
                    cx={this.props.cx}
                    cy={this.props.cy}
                    r={this.props.r}
                    stroke={this.props.stroke}
                    strokeWidth={this.props.strokeWidth}
                    fill={this.props.fill} />
            </ViewElement>
        );
    }
}
