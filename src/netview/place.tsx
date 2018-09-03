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

    public render () {

        const {paths, name, id, type, initExpr, dataLayout, cpLabel, porView,
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

        let porViewElement = null;
        let porViewBBox: BBox | null = null;
        if (porView) {
            const porWidth = .7 * width;
            const porHeight = 2 * font.code.size.small;
            const porX = x + (width - porWidth) / 2;
            const porY = y - porHeight / 2;
            porViewBBox = {x: porX, y: porY, width: porWidth, height: porHeight};
            porViewElement = ( // NOTE: I don't think it will work ... maybe would be better to implement simpler version of place
                <CorePlace
                    paths={{...paths} /* the same as origin place */}
                    {...porViewBBox}
                    id={`porView-${id}`}
                    name={porView}
                    type={""/* do not show type; is the same as original place*/}
                    initExpr=""
                    dataLayout={PlaceDataLayout.MULTISET}
                    triggerAddArc={triggerAddArc}
                />
            );
        }

        const ntX = x + width / 2;
        let ntY;
        if (cpLabelBBox) {
            ntY = y + (height - cpLabelBBox.height / 2) / 2;
        } else {
            ntY = y + height / 2;
        }

        const nameText = Utils.textToSVG(id, name, font.description, "small", {
            x: ntX,
            y: ntY,
            textAnchor: "middle",
            alignmentBaseline: "central",
        });

        return (
            <g>
                <rect className={`place ${cssDataLayout}`}
                    x={x} y={y} width={width} height={height} rx={radius} ry={radius}
                    onMouseDown={triggerMouseDown}
                    onMouseUp={triggerMouseUp}
                    onClick={triggerClick}
                />
                {cpLabelElement}
                {nameText}
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
                    font={font.code}
                    fontSize="normal"
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
                    font={font.code}
                    fontSize="small"
                    triggerPositionChanged={triggerPositionChanged}/>
            </g>
        );
    }
}

export const Place = createMovable<Props, PlaceData>(CorePlace);
