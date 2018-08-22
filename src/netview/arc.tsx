import * as React from 'react'

import {ArcData} from '../netmodel'

type Props = ArcData & {points: Array<{x: number, y: number}>};

export class Arc extends React.PureComponent<Props> {

    public render() {
        const {type, points} = this.props;

        return (
            <polyline
                className="arc"
                points={points.map(({x,y}) => ([x, y])).join(" ")}
                markerEnd={`url(#${type})`} />
        );
    }
}