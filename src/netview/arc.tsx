import * as React from 'react';
import * as Utils from '../utils';

import {PositionChanged} from '../events';

import {ArcData} from '../netmodel';
import {Dict, Path, Position} from '../types';
import {font} from '../visualsetting';
import {TextElement} from './textelement';

type ArcsPositions = Dict<Position> & {
    expression: Position;
}

interface Props {
    data: ArcData;
    path: Path;
    zoom: number;
    pan: Position;
    anchorPosition: Position;
    points: Array<{x: number, y: number}>;
    relatedPositions: ArcsPositions;
    select: () => void;
    remove: () => void;
    changePosition: (evt: PositionChanged) => void;
}

export class Arc extends React.PureComponent<Props> {

    public render() {
        const {
            data: arc, path, zoom, pan,
            anchorPosition, points, relatedPositions,
            changePosition} = this.props;

        const anchoredPoints = points.map(p => Utils.v2dAdd(anchorPosition, p));
        return (
            <g>
            <polyline
                className="arc"
                fill="transparent"
                strokeWidth={10}
                strokeLinejoin="round"
                points={anchoredPoints.map(({x,y}) => ([x, y])).join(" ")}
                markerEnd={`url(#${arc.type})`}
                onClick={this.onClick}
            />

            <TextElement
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
