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
        const {id, expression, type, triggerSelect,
               points, paths, relatedPositions,
                triggerPositionChanged
        } = this.props;

        const onArcClick = (evt: React.MouseEvent) => {
            triggerSelect();

            evt.stopPropagation();
        };

        // NOTE: onMouseDown has to be used when click does not work
        return (
            <g>
            <polyline
                className="arc"
                fill="transparent"
                strokeWidth={10}
                strokeLinejoin="round"
                points={points.map(({x,y}) => ([x, y])).join(" ")}
                markerEnd={`url(#${type})`}
                onClick={onArcClick}
            />
            <TextElement
                className="small"
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
