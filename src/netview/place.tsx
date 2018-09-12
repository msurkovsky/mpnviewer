import * as React from 'react';
import * as Utils from '../utils'

import {endAddingArc, startAddingArc} from '../features/addarc'
import {ArcElement, NetCategory,
        PlaceData, PlaceDataLayout, PlaceElement} from '../netmodel';
import {NetTool} from '../toolbar'
import {BBox, Dict, Path, Position, Size} from '../types';
import {font} from '../visualsetting';
import {TextElement} from './textelement';


// data
// path
// anchorPosition
// position
// size
// relatedPositions
// triggers
// ...rest

type PlacePositions = Dict<Position> & {
    type:  Position;
    initExpr: Position;
}

interface Props {
    data: PlaceData;
    path: Path;
    anchorPosition: Position;
    position: Position;
    size: Size;
    relatedPositions: PlacePositions;
};

export class Place extends React.PureComponent<Props> {

    public render () {

        const {data: place, path,
               anchorPosition, position, size, relatedPositions} = this.props;
        const {width, height} = size;

        const radius = height / 2;
        const cssDataLayout = `${place.dataLayout}Place`;

        const addRemoveArc = (evt: React.MouseEvent) => { // TODO:
            if (netToolbar.tool !== NetTool.ADD_ARC) {
                return;
            }

            if (netToolbar.value === null) {
                const place: PlaceElement = {
                    data: {id, name, dataType, initExpr, dataLayout},
                    type: "place",
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

        const triggerClick = (evt: React.MouseEvent) => {
            triggerSelect();
            addRemoveArc(evt);

            // stop propagation to prevent canvas unselect
            evt.preventDefault();
            evt.stopPropagation();
        }

        let cpLabelElement = null;
        let cpLabelBBox: BBox | null = null;
        if (cpLabel) {
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
                     cpLabel.replace(/\\n/g, ""),
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
        if (name) {
          nameText = Utils.textToSVG(id, name, font.description, "small", {
              x: ntX,
              y: ntY,
              textAnchor: "middle",
              alignmentBaseline: "central",
          });
        }

        let dataTypeElement = null;
        if (dataType) {
            dataTypeElement = <TextElement
                paths={{
                    base: [...paths.base],
                    position: ["relatedPositions", "dataType"],
                }}
                data={{id: `${id}-datatType`, text: dataType}}
                parentPosition={{x, y}}
                netToolbar={netToolbar}
                x={relatedPositions.dataType.x}
                y={relatedPositions.dataType.y}
                font={font.code}
                fontSize="normal"
                triggerPositionChanged={triggerPositionChanged}/>;
        }

        let initExprElement = null;
        if (initExpr) {
            initExprElement = <TextElement
                paths={{
                    base: [...paths.base],
                    position: ["relatedPositions", "initExpr"],
                }}
                data={{id: `${id}-initExpr`, text: initExpr}}
                parentPosition={{x, y}}
                netToolbar={netToolbar}
                x={relatedPositions.initExpr.x}
                y={relatedPositions.initExpr.y}
                font={font.code}
                fontSize="small"
                triggerPositionChanged={triggerPositionChanged}/>
        }

        return (
            <g>
                <rect className={`place ${cssDataLayout}`}
                    x={x} y={y} width={width} height={height} rx={radius} ry={radius}
                    onMouseDown={triggerMouseDown}
                    onMouseUp={triggerMouseUp}
                    onClick={triggerClick}
                />
                {cpLabelElement}
                {dataTypeElement}
                {initExprElement}
                {nameText}
            </g>
        );
    }
}
