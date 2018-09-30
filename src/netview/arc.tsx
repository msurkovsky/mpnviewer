import * as Ramda from 'ramda';
import * as React from 'react';
import * as Utils from '../utils';

/* import {PositionChanged} from '../events';*/

import {ArcData} from '../netmodel';
import {Dict, Omit, Position} from '../types';
import {font} from '../visualsetting';

import {onMouseDown, onMouseUp, PositionableProps} from './positionable'
import {TextElement} from './textelement';

export type ArcPositions = Dict<Position> & {
    expression: Position;
}

type Props = Omit<PositionableProps, "position"> & { // NOTE: The position is
                                                     // added separtely for each
                                                     // point.
    data: ArcData;
    points: Array<{x: number, y: number}>;
    relatedPositions: ArcPositions;
    select: () => void;
    remove: () => void;
    style?: React.SVGProps<SVGPolylineElement>;
}

export class Arc extends React.PureComponent<Props> {

    public static defaultStyleAttrs = {
        stroke: "#000",
        strokeWidth: 1.5,
        strokeLinejoin: "round",
    }

    public render() {
        const {canvasId, data: arc, path, zoom, pan,
            anchorPosition, points, relatedPositions,
            changePosition, style} = this.props;

        const anchoredPoints = points.map(p => Utils.v2dAdd(anchorPosition, p));

        const circles = [];
        for (let i = 1; i < anchoredPoints.length - 1; i++) {
            const p = anchoredPoints[i];
            // draggable points binding move features, in order to change
            // the position of inner points
            const circle = <circle
                key={`${arc.id}-${i}`}
                cx={p.x}
                cy={p.y}
                r={7}
                onMouseDown={this.startMoveInnerPoint(i)}
                onMouseUp={onMouseUp}
                fillOpacity={0.0}
            />
            circles.push(circle);
        }

        return (
            <g>
            <polyline
                {...Ramda.merge(Arc.defaultStyleAttrs, style)}
                fillOpacity="0.0"
                pointerEvents="stroke"
                points={anchoredPoints.map(({x,y}) => ([x, y])).join(" ")}
                markerEnd={`url(#${arc.type})`}
                onClick={this.onClick}
            />
            {circles}

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

    private startMoveInnerPoint = (idx: number) => (evt: React.MouseEvent) => {
        const {canvasId, path, zoom, pan, anchorPosition, changePosition, points} = this.props;
        const position = points[idx];
        const props = {canvasId, path, zoom, pan, anchorPosition, position, changePosition};

        const setInnerPoint = (oldPoints: Position[], changingIdx: number) =>
                (newPosition: Position) => {
            const newPoints = [...points];
            newPoints[changingIdx]=newPosition;

            // strip first and last point, these are NOT inner ones.
            return newPoints.slice(1, newPoints.length - 1);
        };

        onMouseDown(props, ["innerPoints"], setInnerPoint(points, idx))(evt);
    }
}
