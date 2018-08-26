import * as React from 'react';

import {endAddingArc, startAddingArc} from '../features/addarc'
import {ArcElement, NetCategory, PlaceData, PlaceDataLayout} from '../netmodel';
import {NetTool, NetToolbarState} from '../toolbar'
import {Dict, Position, Size} from '../types';
import {createMovable, MouseTriggers, PositionTriggers} from './movable';
import {Viewer} from './net'
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
    viewerInst: Viewer;
    netToolbar: NetToolbarState;
    triggerChangeNetToolbarValue: (value: any) => void;
    triggerAddArc: (arc: ArcElement) => void;
    triggerRemoveElement: (category: NetCategory) => (id: string) => void;
};

class CorePlace extends React.PureComponent<Props> {

    public render () {

        const {paths, name, id, type, initExpr, dataLayout, x, y, width, height, relatedPositions,
               viewerInst, triggerAddArc, triggerRemoveElement,
               netToolbar, triggerChangeNetToolbarValue,
               triggerMouseDown, triggerMouseUp,
               triggerPositionChanged} = this.props;

        const radius = height / 2;
        const cssDataLayout = dataLayout === PlaceDataLayout.MULTISET? "bPlace" : "qPlace";

        const addRemoveArc = (evt: React.MouseEvent) => {
            if (netToolbar.tool !== NetTool.ADD_ARC) {
                return;
            }

            if (netToolbar.value === null) {
                const place = {
                    data: {id, name, type, initExpr, dataLayout},
                    position: {x, y},
                    size: {width, height},
                };
                startAddingArc(
                    viewerInst,
                    place,
                    paths.base,
                    triggerAddArc,
                    triggerRemoveElement("arcs"),
                    triggerChangeNetToolbarValue
                );
            } else {
                endAddingArc(paths.base);
            }
        };

        return (
            <g>
                <rect className={`place ${cssDataLayout}`}
                    x={x} y={y} width={width} height={height} rx={radius} ry={radius}
                    onMouseDown={triggerMouseDown}
                    onMouseUp={triggerMouseUp}
                    onClick={addRemoveArc}
                />
                <TextElement
                    paths={{
                        base: [...paths.base],
                        position: ["relatedPositions", "type"],
                    }}
                    data={{id: `${id}-type`, text: type}}
                    parentPosition={{x, y}}
                    netToolbar={netToolbar}
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
                    netToolbar={netToolbar}
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
