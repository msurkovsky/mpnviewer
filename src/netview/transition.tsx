import * as React from 'react';
import * as Utils from '../utils'

import {endAddingArc, startAddingArc} from '../features/addarc'
import {ArcElement, NetCategory, TransitionData} from '../netmodel'
import {NetTool, NetToolbarState} from '../toolbar'
import {BBox, Dict, Position, Size} from '../types';
import {font} from '../visualsetting';
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

        const {paths, id, elementType, name, guard, codeRef,
               x, y, width, height, relatedPositions,
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
                    data: {id, elementType, name, guard},
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
                font={font.code}
                fontSize="small"
                triggerPositionChanged={triggerPositionChanged} />
        }

        let codeRefElement = null;
        let codeRefBBox: BBox | null = null;
        if (codeRef) {
            const crWidth = .7 * width;
            const crHeight = font.code.size.small * 1.8;
            const crX = x + (width - crWidth) / 2;
            const crY = y;
            codeRefBBox = { x: crX, y: crY, width: crWidth, height: crHeight };
            codeRefElement = (<g>
                <rect className="codeRef" {...codeRefBBox} />
                {Utils.textToSVG(`${id}-code-`, Utils.codeRef2String(codeRef), font.code, "small", {
                    x: crX + crWidth / 2,
                    y: crY + crHeight / 2,
                    textAnchor: "middle",
                    alignmentBaseline: "central",
                })}
            </g>);

        }

        const ntX = x + width / 2;
        let ntY;
        if (codeRefBBox) {
            ntY = y + codeRefBBox.height + (height - codeRefBBox.height) / 2;
        } else {
            ntY = y + height /2
        }

        let nameText = null;
        if (name) {
            nameText = Utils.textToSVG(id, name, font.description, "small", {
                x: ntX,
                y: ntY,
                textAnchor: "middle",
                alignmentBaseline: "central",
            });
        }

        return (
            <g>
                <rect className="transition"
                    x={x} y={y} width={width} height={height}
                    onMouseDown={triggerMouseDown}
                    onMouseUp={triggerMouseUp}
                    onClick={triggerClick}
                />
                {codeRefElement}
                {nameText}
                {guardElement}
            </g>
        );
    }
}

export const Transition = createMovable<Props, TransitionData>(CoreTransition);
