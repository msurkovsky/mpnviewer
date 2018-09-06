import * as React from 'react';
import {emptyFn, getPositionOnCanvas, v2dScalarMul, v2dSub} from '../utils';

import {PositionChanged} from '../events';
import {ArcElement, NetCategory} from '../netmodel';
import {NetToolbarState} from '../toolbar';
import {Dict, Position, Size, Vector2d} from '../types';
import {FontSetting, FontSize} from '../visualsetting';

import {CanvasContext, CanvasCtxData, Viewer} from './net';

// Movable binders ==============================================================

let activeId: string | null = null;
let pointerElementDiff: Vector2d | null = null;

const moveInfo: Dict<{
    x: number;
    y: number;
    zoom: number;
    pan: Position;
    paths: Dict<string[]>;
    triggerPositionChanged: (evt: PositionChanged) => void;
} | null> = {};

const handleMoving = (e: MouseEvent) => {
    if (activeId === null) {
        return;
    }

    const info = moveInfo[activeId];
    if (pointerElementDiff === null || info === null) {
        return;
    }
    e.stopPropagation();

    const {x, y, zoom, pan, paths, triggerPositionChanged} = info;

    const p = getPositionOnCanvas(e);
    const newPos = v2dSub(
        v2dScalarMul(1/zoom, v2dSub(p, pan)),
        pointerElementDiff);

    triggerPositionChanged({
        path: paths.base.concat(paths.position),
        new: newPos,
        old: {x, y},
    });
}

export const onMovableMouseDown = (id: string) => (e: React.MouseEvent) => {
    e.stopPropagation();

    const info = moveInfo[id];
    if (info === null) {
        return;
    }
    activeId = id;

    const {x, y, zoom, pan} = info;

    const p = getPositionOnCanvas(e);
    pointerElementDiff = v2dSub(v2dScalarMul(1/zoom, v2dSub(p, pan)), {x, y});

    document.addEventListener('mousemove', handleMoving);
}

export const onMovableMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();

    document.removeEventListener('mousemove', handleMoving);
    activeId = null;
    // NOTE: do not remove moveInfo[activeId]; need to keep the last info
    // otherwise it would have to be passed by `onMovableMouseDown`
    pointerElementDiff = null;
}


// Moveable HOC ================================================================

export interface MouseTriggers {
    triggerMouseDown?: (e: React.MouseEvent) => void;
    triggerMouseUp?: (e: React.MouseEvent) => void;
}


export interface PositionTriggers {
    triggerPositionChanged?: (e: PositionChanged) => void;
}


type BaseComponentProps = Position & Partial<Size> & MouseTriggers & PositionTriggers & {
    paths?: {
        base: string[];
        position: string[];
    };
    triggerSelect?: () => void;
    relatedPositions?: Dict<Position>;
    viewerInst?: Viewer;
    netToolbar?: NetToolbarState;
    triggerChangeNetToolbarValue?: (value: any) => void;
    triggerAddArc?: (arc: ArcElement) => void;
    triggerRemoveElement?: (category: NetCategory) => (id: string) => void;
    font?: FontSetting;
    fontSize?: FontSize;
    className?: string;
};

// => // shared props of BaseComponentProps and Moveable Props
type Props<T extends {}> = Position & Partial<Size> & PositionTriggers & {
    paths: {                                                                    //
        base: string[];
        position: string[];
    };
    data: T;
    parentPosition: Position;
    triggerSelect?: () => void;                                                 //
    relatedPositions?: Dict<Position>;                                          //
    viewerInst?: Viewer;                                                        //
    netToolbar?: NetToolbarState;                                               //
    triggerChangeNetToolbarValue?: (value: any) => void;                        //
    triggerAddArc?: (arc: ArcElement) => void;                                  //
    triggerRemoveElement?: (category: NetCategory) => (id: string) => void;     //
    font?: FontSetting;                                                         //
    fontSize?: FontSize;                                                        //
    className?: string;                                                         //
};

export function createMovable<ComponentProps extends BaseComponentProps,
                              DataType extends {id: string}>(
    Component: React.ComponentType<ComponentProps>) {


    class Moveable extends React.Component<Props<DataType> & CanvasCtxData, Position> {

        public render() {
            const {className, paths, data,
                   parentPosition: {x: px, y: py}, x, y, width, height,
                   relatedPositions, zoom, pan,
                   viewerInst, triggerSelect,
                   triggerAddArc, triggerRemoveElement,
                   netToolbar, triggerChangeNetToolbarValue,
                   font, fontSize,
                   triggerPositionChanged=emptyFn} = this.props;

            moveInfo[data.id] = {x, y, zoom, pan, paths, triggerPositionChanged};
            const handleMouseDown = onMovableMouseDown(data.id);

            return (
                <Component
                    {...data}
                    className={className}
                    paths={paths}
                    x={px+x}
                    y={py+y}
                    width={width}
                    height={height}
                    viewerInst={viewerInst}
                    netToolbar={netToolbar}
                    relatedPositions={relatedPositions}
                    font={font}
                    fontSize={fontSize}
                    triggerSelect={triggerSelect}
                    triggerAddArc={triggerAddArc}
                    triggerRemoveElement={triggerRemoveElement}
                    triggerChangeNetToolbarValue={triggerChangeNetToolbarValue}
                    triggerMouseDown={handleMouseDown}
                    triggerMouseUp={onMovableMouseUp}
                    triggerPositionChanged={triggerPositionChanged}
                />
            );
        }
    }

    return class extends React.Component<Props<DataType>, any> {
        public render() {
            return (
                <CanvasContext.Consumer>
                    {({zoom, pan}) => <Moveable {...this.props} zoom={zoom} pan={pan} />}
                </CanvasContext.Consumer>
            );
        }
    }
}
