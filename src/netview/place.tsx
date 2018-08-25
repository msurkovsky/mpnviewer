import * as React from 'react';

import {PlaceData, PlaceDataLayout} from '../netmodel';
import {Dict, Position, Size} from '../types';
import {createMovable, MouseTriggers, PositionTriggers} from './movable';
import {TextElement} from './textelement';


type PlacePositions = Dict<Position> & {
    type:  Position;
    initExpr: Position;
}

type Props = PlaceData & Position & Size & MouseTriggers & PositionTriggers & {
    paths: {
        base: string[];
        position: string[];
    };
    relatedPositions: PlacePositions;
};

class CorePlace extends React.PureComponent<Props> {

    public render () {

        const {paths, name, id, type, initExpr, dataLayout, x, y, width, height, relatedPositions,
               triggerMouseDown, triggerMouseUp,
               triggerPositionChanged} = this.props;

        const radius = height / 2;
        const cssDataLayout = dataLayout === PlaceDataLayout.MULTISET? "bPlace" : "qPlace";

        return (
            <g>
            <rect className={`place ${cssDataLayout}`}
                  x={x} y={y} width={width} height={height} rx={radius} ry={radius}
                  onMouseDown={triggerMouseDown} onMouseUp={triggerMouseUp} />
                <TextElement
                    paths={{
                        base: [...paths.base],
                        position: ["relatedPositions", "type"],
                    }}
                    data={{id: `${id}-type`, text: type}}
                    parentPosition={{x, y}}
                    x={relatedPositions.type.x}
                    y={relatedPositions.type.y}
                    triggerPositionChanged={triggerPositionChanged}/>
                <TextElement
                    paths={{
                        base: [...paths.base],
                        position: ["relatedPositions", "initExpr"],
                    }}
                    data={{id: `${id}-initExpr`, text: initExpr}}
                    parentPosition={{x, y}}
                    x={relatedPositions.initExpr.x}
                    y={relatedPositions.initExpr.y}
                    triggerPositionChanged={triggerPositionChanged}/>
                <text x={x+width/2} y={y+height/2} textAnchor="middle" alignmentBaseline="central">
                    {name}
                </text>
            </g>
        );
    }
}

export const Place = createMovable<Props, PlaceData>(CorePlace);
