import * as React from 'react'

import {ArcData} from '../netmodel'

type Props = ArcData & {
    points: Array<{x: number, y: number}>;
    triggerSelect: () => void;
};

export class Arc extends React.PureComponent<Props> {

    public render() {
        const {type, points} = this.props;

        return (
            <polyline
                className="arc"
                fill="none"
                strokeLinejoin="round"
                points={points.map(({x,y}) => ([x, y])).join(" ")}
                markerEnd={`url(#${type})`} />
        );
    }
}
