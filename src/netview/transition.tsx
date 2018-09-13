import * as React from 'react';
import * as Utils from '../utils';

import {PositionChanged} from '../events'
import {startMoving, stopMoving} from '../features/move';

import {TransitionData} from '../netmodel';
import {BBox, Dict, Path, Position, Size} from '../types';
import {font} from '../visualsetting';
import {TextElement} from './textelement';

import {CANVAS_ID} from './net';

type TransPositions = Dict<Position> & {
    guard: Position;
}

interface Props {
    data: TransitionData;
    path: Path;
    zoom: number;
    pan: Position;
    anchorPosition: Position;
    position: Position;
    size: Size;
    relatedPositions: TransPositions;
    select: () => void;
    remove: () => void;
    createNewArc: () => boolean;
    changePosition: (evt: PositionChanged) => void;
}

export class Transition extends React.PureComponent<Props> {

    public render() {

        const {
            data: transition, path, zoom, pan,
            anchorPosition, position, size, relatedPositions,
            changePosition} = this.props;

        const {x, y} = Utils.v2dAdd(anchorPosition, position);
        const {width, height} = size;

        let guardElement = null;
        if (transition.guard && transition.guard.length > 0) {
            guardElement = <TextElement
                path={path.concat(["relatedPositions", "guar"])}
                data={{
                    id: `${transition.id}-guard`,
                    text: `[${transition.guard.join(', ')}]`
                }}
                zoom={zoom}
                pan={pan}
                anchorPosition={{x, y}}
                position={relatedPositions.guard}
                font={font.code}
                fontSize="small"
                changePosition={changePosition} />
        }

        let codeRefElement = null;
        let codeRefBBox: BBox | null = null;
        if (transition.codeRef) {
            const crWidth = .7 * width;
            const crHeight = font.code.size.small * 1.8;
            const crX = x + (width - crWidth) / 2;
            const crY = y;
            codeRefBBox = { x: crX, y: crY, width: crWidth, height: crHeight };
            codeRefElement = (<g>
                <rect className="codeRef" {...codeRefBBox} />
                {Utils.textToSVG(
                    `${transition.id}-code-`,
                     Utils.codeRef2String(transition.codeRef),
                     font.code,
                     "small", {
                        x: crX + crWidth / 2,
                        y: crY + crHeight / 2,
                        textAnchor: "middle",
                        alignmentBaseline: "central",
                     }
                )}
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
        if (transition.name) {
            nameText = Utils.textToSVG(
                transition.id,
                transition.name,
                font.description,
                "small", {
                    x: ntX,
                    y: ntY,
                    textAnchor: "middle",
                    alignmentBaseline: "central",
                }
            );
        }

        return (
            <g>
                <rect className="transition"
                    x={x} y={y} width={width} height={height}
                    onMouseDown={this.onMouseDown}
                    onMouseUp={this.onMouseUp}
                    onClick={this.onClick}
                />
                {codeRefElement}
                {nameText}
                {guardElement}
            </g>
        );
    }


    private onClick = (evt: React.MouseEvent) => {
        const {createNewArc, select} = this.props;
        const successfull = createNewArc();
        if (!successfull) {
            select();
        }

        // stop propagation to prevent canvas unselect
        evt.preventDefault();
        evt.stopPropagation();
    }

    private onMouseDown = (evt: React.MouseEvent) => {
        const {path, zoom, pan, position, changePosition} = this.props;

        const {x, y} = position;

        startMoving(CANVAS_ID, x, y, zoom, pan, path, changePosition);
    }

    private onMouseUp = (evt: React.MouseEvent) => {
        stopMoving(evt.nativeEvent);
    }
}
