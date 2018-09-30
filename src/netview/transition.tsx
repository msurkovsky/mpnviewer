import * as Ramda from 'ramda';
import * as React from 'react';
import * as Utils from '../utils';

import {TransitionData} from '../netmodel';
import {BBox, Dict, Position, Size} from '../types';
import {font} from '../visualsetting';

import {onMouseDown, onMouseUp, PositionableProps} from './positionable';
import {TextElement} from './textelement';

type TransPositions = Dict<Position> & {
    guard: Position;
}

type Props =  PositionableProps & {
    data: TransitionData;
    relatedPositions: TransPositions;
    size: Size;
    select: () => void;
    remove: () => void;
    createNewArc: () => boolean;
    style?: React.SVGProps<SVGRectElement>;
}

export class Transition extends React.PureComponent<Props> {

    public static defaultStyleAttrs = {
        stroke: "#000",
        strokeWidth: 2,
        fill: "#fff",
    };

    public render() {

        const {canvasId, data: transition, path, zoom, pan,
            anchorPosition, position, size, relatedPositions,
            changePosition, style} = this.props;

        const {x, y} = Utils.v2dAdd(anchorPosition, position);
        const {width, height} = size;

        let guardElement = null;
        if (transition.guard && transition.guard.length > 0) {
            guardElement = <TextElement
                canvasId={canvasId}
                path={path.concat(["relatedPositions", "guard"])}
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
                <rect fill="#fff" stroke="#000" strokeWidth="2px"
                      {...codeRefBBox} />
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
                <rect {...Ramda.merge(Transition.defaultStyleAttrs, style)}
                    x={x} y={y} width={width} height={height}
                    onMouseDown={onMouseDown(this.props, ["position"])}
                    onMouseUp={onMouseUp}
                    onClick={this.onClick}
                />
                {codeRefElement}
                {nameText}
                {guardElement}
            </g>
        );
    }

    private onClick = (evt: React.MouseEvent) => { // selectable
        const { createNewArc, select } = this.props;

        const successfull = createNewArc();
        if (!successfull) {
            select();
        }

        // stop propagation to prevent canvas unselect
        evt.preventDefault();
        evt.stopPropagation();
    }
}
