import * as React from 'react'

import {ArcData} from '../netmodel'

type Props = ArcData & {points: Array<{x: number, y: number}>};

export class Arc extends React.PureComponent<Props> {

    public render() {
        const points = this.props.points;

        return (
            <polyline points={points.map(({x,y}) => ([x, y])).join(" ")} stroke="#000" />
        );
    }
}
