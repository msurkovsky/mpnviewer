import * as React from 'react';
import * as Utils from '../utils';

import {PlaceData} from '../netmodel';
import {BBox, Dict, Position, Size} from '../types';
import {font} from '../visualsetting';

import {onMouseDown, onMouseUp, PositionableProps} from './positionable';
import {TextElement} from './textelement';

type PlacePositions = Dict<Position> & {
    type:  Position;
    initExpr: Position;
}

type Props = PositionableProps & {
    data: PlaceData;
    relatedPositions: PlacePositions;
    size: Size;
    select: () => void;
    remove: () => void;
    createNewArc: () => boolean;
};

export class Place extends React.PureComponent<Props> {

    public render () {

        const {
            data: place, path, zoom, pan,
            anchorPosition, position, size, relatedPositions,
            changePosition} = this.props;

        const {x, y} = Utils.v2dAdd(anchorPosition, position);
        const {width, height} = size;

        const radius = height / 2;
        const cssDataLayout = `${place.dataLayout}Place`;


        let cpLabelElement = null;
        let cpLabelBBox: BBox | null = null;
        if (place.cpLabel) {
            const cplWidth = .6 * width;
            const cplHeight = 1.8 * font.description.size.small;
            const cplX = x + (width - cplWidth) / 2;
            const cplY = y + height - cplHeight / 2;
            const cplRadius = cplHeight / 2;
            cpLabelBBox = {x: cplX, y: cplY, width: cplWidth, height: cplHeight};
            cpLabelElement = (<g>
                <rect className="cpLabel" {...cpLabelBBox} rx={cplRadius} ry={cplRadius} />
                {Utils.textToSVG(
                     `{id}-cpLabel-`,
                     place.cpLabel.replace(/\\n/g, ""),
                     font.description,
                     "small", {
                      x: cplX + cplWidth / 2,
                      y: cplY + cplHeight / 2,
                      textAnchor: "middle",
                      alignmentBaseline: "central",
                })}
            </g>);
        }

        const ntX = x + width / 2;
        let ntY;
        if (cpLabelBBox) {
            ntY = y + (height - cpLabelBBox.height / 2) / 2;
        } else {
            ntY = y + height / 2;
        }

        let nameText = null;
        if (place.name) {
            nameText = Utils.textToSVG(
                place.id,
                place.name,
                font.description,
                "small", {
                    x: ntX,
                    y: ntY,
                    textAnchor: "middle",
                    alignmentBaseline: "central",
                });
        }

        let dataTypeElement = null;
        // TODO: path should be just path of the element, but the text element does not know about te position
        if (place.dataType) {
            dataTypeElement = <TextElement
                path={path.concat(["relatedPositions", "dataType"])}
                data={{id: `${place.id}-datatType`, text: place.dataType}}
                zoom={zoom}
                pan={pan}
                anchorPosition={{x, y}}
                position={relatedPositions.dataType}
                font={font.code}
                fontSize="normal"
                changePosition={changePosition}/>;
        }

        let initExprElement = null;
        if (place.initExpr) {
            initExprElement = <TextElement
                path={path.concat(["relatedPositions", "initExpr"])}
                data={{id: `${place.id}-initExpr`, text: place.initExpr}}
                zoom={zoom}
                pan={pan}
                anchorPosition={{x, y}}
                position={relatedPositions.initExpr}
                font={font.code}
                fontSize="small"
                changePosition={changePosition}/>;
        }

        return (
            <g>
                <rect className={`place ${cssDataLayout}`}
                    x={x} y={y} width={width} height={height} rx={radius} ry={radius}
                    onMouseDown={onMouseDown(this.props, ["position"])}
                    onMouseUp={onMouseUp}
                    onClick={this.onClick}
                />
                {cpLabelElement}
                {dataTypeElement}
                {initExprElement}
                {nameText}
            </g>
        );
    }

    private onClick = (evt: React.MouseEvent) => {
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
