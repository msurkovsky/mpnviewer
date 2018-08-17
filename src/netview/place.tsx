import * as React from 'react';

import {PlaceData} from '../netmodel';
import {Dict, Position, Size} from '../types';
import {createMovable, MouseTriggers, PositionTriggers} from './movable';
import {TextElement} from './textelement';


type PlacePositions = Dict<Position> & {
    type: Position,
    initExpr: Position,
}

type Props = PlaceData & Position & Size & MouseTriggers & PositionTriggers & {
    path: string[],
    relatedPositions: PlacePositions;
};

class CorePlace extends React.PureComponent<Props> {

    public render () {

        const {path, type, initExpr, x, y, width, height, relatedPositions,
               triggerMouseDown, triggerMouseUp,
               triggerPositionChanged} = this.props;

        const radius = height / 2;

        const basePath = [...path].splice(0, path.length-1);
        return (
            <g>
                <rect x={x} y={y} width={width} height={height} rx={radius} ry={radius}
                      onMouseDown={triggerMouseDown} onMouseUp={triggerMouseUp} />
                <TextElement
                    path={basePath.concat(["relatedPositions", "type"])}
                    data={{text: type}}
                    parentPosition={{x, y}}
                    x={relatedPositions.type.x}
                    y={relatedPositions.type.y}
                    triggerPositionChanged={triggerPositionChanged}/>
                <TextElement
                    path={basePath.concat(["relatedPositions", "initExpr"])}
                    data={{text: initExpr}}
                    parentPosition={{x, y}}
                    x={relatedPositions.initExpr.x}
                    y={relatedPositions.initExpr.y}
                    triggerPositionChanged={triggerPositionChanged}/>
                {/* TODO: name of the place will always be aligned to the center */}
            </g>
        );
    }
}

export const Place = createMovable<Props, PlaceData>(CorePlace);
