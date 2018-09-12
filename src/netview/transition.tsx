import * as React from 'react';
import * as Utils from '../utils'

import {endAddingArc, startAddingArc} from '../features/addarc'
import {ArcElement, NetCategory,
        TransitionData, TransitionElement} from '../netmodel'
import {NetTool, NetToolbarState} from '../toolbar'
import {BBox, Dict, Path, Position, Size} from '../types';
import {font} from '../visualsetting';
import {TextElement} from './textelement';


type TransPositions = Dict<Position> & {
    guard: Position;
}

interface Props {
    data: TransitionData;
    path: Path;
    anchorPosition: Position;
    position: Position;
    size: Size;
    relatedPositions: TransPositions;
    select: () => void;
    remove: () => void;
    createNewArc: () => void;
}

export class Transition extends React.PureComponent<Props> {

    public render() {

        const {
            data: transition, path,
            anchorPosition, position, size, relatedPositions,
            select, remove, createNewArc,
        } = this.props;

        /*
        const triggerClick = (evt: React.MouseEvent) => {
            triggerSelect();
            addRemoveArc(evt);

            // stop propagation to prevent canvas unselect
            evt.stopPropagation();
        }
        */

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
