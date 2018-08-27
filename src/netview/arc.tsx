import * as React from 'react'

import {ArcData} from '../netmodel'
import {Dict, Position} from '../types';
import {MouseTriggers, PositionTriggers} from './movable';
import {TextElement} from './textelement';

type ArcsPositions = Dict<Position> & {
    expression: Position;
}

type Props = ArcData & MouseTriggers & PositionTriggers & {
    paths: { base: string[] }
    points: Array<{x: number, y: number}>;
    relatedPositions: ArcsPositions;
    triggerSelect: () => void;
};

export class Arc extends React.PureComponent<Props> {

    public render() {
        const {id, expression, type,
               points, paths, relatedPositions,
               triggerSelect, triggerPositionChanged
        } = this.props;

        // NOTE: onMouseDown has to be used when click does not work
        return (
            <g>
            <polyline
                className="arc"
                fill="transparent"
                strokeLinejoin="round"
                points={points.map(({x,y}) => ([x, y])).join(" ")}
                markerEnd={`url(#${type})`}
                onMouseDown={triggerSelect}
            />
            <TextElement
                paths={{
                    base: [...paths.base],
                    position: ["relatedPositions", "expression"],
                }}
                data={{id: `${id}-expression`, text: expression}}
                parentPosition={{...points[0]}}
                x={relatedPositions.expression.x}
                y={relatedPositions.expression.y}
                triggerPositionChanged={triggerPositionChanged}/>
            </g>
        );
    }
}
