/* import { Component, SVGProps } from 'react'; */
import * as React from 'react'

/* interface IPlaceProps { */
/* "cx": number; */
/* "cy": number; */
/* "r": number; */
/* "stroke"?: string; */
/* "stroke-width"?: number; */
/* "fill"?: string; */
/* } */

export class Place extends React.Component<PlaceProps, {}> {

    protected static defaultProps = {
        "fill": "#fff",
        "stroke": "#000",
        "strokeWidth": 2,
    };

    public render () {
        return (
            <circle
                cx={this.props.cx}
                cy={this.props.cy}
                r={this.props.r}
                stroke={this.props.stroke}
                strokeWidth={this.props.strokeWidth}
                fill={this.props.fill} />
        );
    }
}

export type PlaceProps = React.SVGProps<SVGCircleElement>;
