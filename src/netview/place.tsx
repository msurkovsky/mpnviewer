import {pick} from 'ramda';
import * as React from 'react';
import * as Utils from '../utils'

import {endAddingArc, startAddingArc} from '../features/addarc'
import {ArcElement, NetCategory, PlaceData, PlaceDataLayout} from '../netmodel';
import {NetTool, NetToolbarState} from '../toolbar'
import {BBox, Dict, Position, Size} from '../types';
import {font} from '../visualsetting';
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
    triggerSelect: () => void;
    triggerAddArc: (arc: ArcElement) => void;
    triggerRemoveElement: (category: NetCategory) => (id: string) => void;
};

class CorePlace extends React.PureComponent<Props> {

    public getPosition (): Position {
        return pick(['x','y'], this.props);
    }

    public render () {

        const {paths, name, id, type, initExpr, dataLayout, cpLabel,
               x, y, width, height, relatedPositions,
               viewerInst, triggerAddArc, triggerRemoveElement,
               netToolbar, triggerChangeNetToolbarValue,
               triggerMouseDown, triggerMouseUp, triggerSelect,
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

        let typeElement = null;
        if (type) {
            typeElement = <TextElement
                paths={{
                    base: [...paths.base],
                    position: ["relatedPositions", "type"],
                }}
                data={{id: `${id}-type`, text: type}}
                parentPosition={{x, y}}
                netToolbar={netToolbar}
                x={relatedPositions.type.x}
                y={relatedPositions.type.y}
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
                {typeElement}
                {initExprElement}
                {nameText}
            </g>
        );
    }
}

export const Place = createMovable<Props, PlaceData>(CorePlace);
