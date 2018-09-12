import * as React from 'react';
import * as Utils from '../utils';

import {PositionChanged} from '../events';

import {ArcData} from '../netmodel';
import {Dict, ID, Path, Position} from '../types';
import {font} from '../visualsetting';
import {TextElement} from './textelement';

export type ArcPositions = Dict<Position> & {
    expression: Position;
}

interface Props {
    canvasId: ID;
    data: ArcData;
    path: Path;
    zoom: number;
    pan: Position;
    anchorPosition: Position;
    points: Array<{x: number, y: number}>;
    relatedPositions: ArcPositions;
    select: () => void;
    remove: () => void;
    changePosition: (evt: PositionChanged) => void;
}

export class Arc extends React.PureComponent<Props> {

    public render() {
        const {canvasId, data: arc, path, zoom, pan,
            anchorPosition, points, relatedPositions,
            changePosition} = this.props;

        const anchoredPoints = points.map(p => Utils.v2dAdd(anchorPosition, p));
        return (
            <g>
            <polyline
                fillOpacity="0.0"
                stroke="#000"
                strokeWidth="1.5px"
                strokeLinejoin="round"
                pointerEvents="stroke"
                points={anchoredPoints.map(({x,y}) => ([x, y])).join(" ")}
                markerEnd={`url(#${arc.type})`}
                onClick={this.onClick}
            />

            <TextElement
                canvasId={canvasId}
                path={path.concat(["relatedPositions", "expressions"])}
                data={{id: `${arc.id}-expression`, text: arc.expression}}
                zoom={zoom}
                pan={pan}
                anchorPosition={anchorPosition}
                position={relatedPositions.expression}
                font={font.code}
                fontSize="small"
                changePosition={changePosition}/>
            </g>
        );
    }

    private onClick = (evt: React.MouseEvent) => {
        const select = this.props.select;
        select();

        evt.stopPropagation();
    }
}
