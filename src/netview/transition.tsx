import * as React from 'react';

import {TransitionData} from '../netmodel'
import {Dict, Position, Size} from '../types';
import {createMovable, MouseTriggers, PositionTriggers} from './movable';
import {TextElement} from './textelement';

type TransPositions = Dict<Position> & {
    guard: Position;
}

type Props = TransitionData & Position & Size & MouseTriggers & PositionTriggers & {
    paths: {
        base: string[];
        position: string[];
    }
    relatedPositions: TransPositions
}

class CoreTransition extends React.PureComponent<Props> {

    public render() {

        const {paths, name, guard, x, y, width, height, relatedPositions,
               triggerMouseDown, triggerMouseUp,
               triggerPositionChanged} = this.props;

        let guardElement = null;
        if (guard) {
            guardElement = <TextElement
                paths={{
                    base: [...paths.base],
                    position: ["relatedPositions", "guard"]
                }}
                data={{ text: `[${guard.join(', ')}]` }}
                parentPosition={{x, y}}
                x={relatedPositions.guard.x}
                y={relatedPositions.guard.y}
                triggerPositionChanged={triggerPositionChanged} />
        }
        return (
            <g>
                <rect className="transition"
                      x={x} y={y} width={width} height={height}
                      onMouseDown={triggerMouseDown} onMouseUp={triggerMouseUp} />
                <text
                    x={x+width/2}
                    y={y+height/2}
                    textAnchor="middle"
                    alignmentBaseline="central">{name}</text>
                {guardElement}
            </g>
        );
    }
}

export const Transition = createMovable<Props, TransitionData>(CoreTransition);
