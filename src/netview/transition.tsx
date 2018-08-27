import * as React from 'react';

import {endAddingArc, startAddingArc} from '../features/addarc'
import {ArcElement, NetCategory, TransitionData} from '../netmodel'
import {NetTool, NetToolbarState} from '../toolbar'
import {Dict, Position, Size} from '../types';
import {createMovable, MouseTriggers, PositionTriggers} from './movable';
import {Viewer} from './net'
import {TextElement} from './textelement';

type TransPositions = Dict<Position> & {
    guard: Position;
}

type Props = TransitionData & Position & Size & MouseTriggers & PositionTriggers & {
    paths: {
        base: string[];
        position: string[];
    }
    relatedPositions: TransPositions;
    viewerInst: Viewer;
    netToolbar: NetToolbarState;
    triggerChangeNetToolbarValue: (value: any) => void;
    triggerSelect: () => void;
    triggerAddArc: (arc: ArcElement) => void;
    triggerRemoveElement: (category: NetCategory) => (id: string) => void;
}

class CoreTransition extends React.PureComponent<Props> {

    public render() {

        const {paths, id, name, guard, x, y, width, height, relatedPositions,
               viewerInst, triggerAddArc, triggerRemoveElement,
               netToolbar, triggerChangeNetToolbarValue,
               triggerMouseDown, triggerMouseUp, triggerSelect,
               triggerPositionChanged} = this.props;

        const addRemoveArc = (evt: React.MouseEvent) => {
            if (netToolbar.tool !== NetTool.ADD_ARC) {
                return;
            }

            if (netToolbar.value === null) {
                const transition = {
                    data: {id, name, guard},
                    position: {x, y},
                    size: {width, height}
                };
                startAddingArc(
                    viewerInst,
                    transition,
                    paths.base,
                    triggerAddArc,
                    triggerRemoveElement("arcs"),
                    triggerChangeNetToolbarValue
                );
            } else {
                endAddingArc(paths.base);
            }
        };

        const triggerClick = (evt: React.MouseEvent) => {
            triggerSelect();
            addRemoveArc(evt);

            // stop propagation to prevent canvas unselect
            evt.stopPropagation();
        }

        let guardElement = null;
        if (guard && guard.length > 0) {
            guardElement = <TextElement
                paths={{
                    base: [...paths.base],
                    position: ["relatedPositions", "guard"]
                }}
                data={{id: `${id}-guard`, text: `[${guard.join(', ')}]` }}
                parentPosition={{x, y}}
                x={relatedPositions.guard.x}
                y={relatedPositions.guard.y}
                triggerPositionChanged={triggerPositionChanged} />
        }
        return (
            <g>
                <rect className="transition"
                    x={x} y={y} width={width} height={height}
                    onMouseDown={triggerMouseDown}
                    onMouseUp={triggerMouseUp}
                    onClick={triggerClick}
                />
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
