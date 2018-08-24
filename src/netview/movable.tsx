import * as React from 'react'
import * as Utils from '../utils'

import {PositionChanged} from '../events'
import {Dict, Position, Size, Vector2d} from '../types'

import {CanvasContext, CanvasCtxData} from './net'

// Movable binders ==============================================================

let activeId: string | null = null;
let pointerElementDiff: Vector2d | null = null;
const moveInfo: {[key: string]: {
    x: number;
    y: number;
    zoom: number;
    pan: Position;
    paths: {[key: string]: string[]};
    triggerPositionChanged: (evt: PositionChanged) => void;
} | null} = {};

const handleMoving = (e: MouseEvent) => {
    if (activeId === null) {
        return;
    }

    const info = moveInfo[activeId];
    if (pointerElementDiff === null || info === null) {
        return;
    }
    e.preventDefault();

    const {x, y, zoom, pan, paths, triggerPositionChanged} = info;

    const newPos = Utils.v2dSub({
        x: (e.clientX - pan.x) / zoom,
        y: (e.clientY - pan.y) / zoom}, pointerElementDiff);

    triggerPositionChanged({
        path: paths.base.concat(paths.position),
        new: newPos,
        old: {x, y},
    });
}

export const onMovableMouseDown = (id: string) => (e: React.MouseEvent) => {

    e.preventDefault();
    e.stopPropagation(); // When click on moveable stop propagation -> avoid paning canvas

    const info = moveInfo[id];
    if (info === null) {
        return;
    }
    activeId = id;

    const {x, y, zoom, pan} = info;

    pointerElementDiff = Utils.v2dSub({
        x: (e.clientX - pan.x) / zoom,
        y: (e.clientY - pan.y) / zoom
    }, { x, y });

    document.addEventListener('mousemove', handleMoving);
}

export const onMovableMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();

    if (handleMoving !== null) {
        document.removeEventListener('mousemove', handleMoving);
    }
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
    relatedPositions?: Dict<Position>;
};

type Props<T extends {}> = Position & Partial<Size> & PositionTriggers & {
    paths: {
        base: string[];
        position: string[];
    };
    data: T;
    parentPosition: Position;
    relatedPositions?: Dict<Position>;
};

export function createMovable<ComponentProps extends BaseComponentProps,
                              DataType extends {id: string}>(
    Component: React.ComponentType<ComponentProps>) {


    class Moveable extends React.Component<Props<DataType> & CanvasCtxData, Position> {

        public render() {
            const {paths, data,
                   parentPosition: {x: px, y: py}, x, y, width, height,
                   relatedPositions, zoom, pan,
                   triggerPositionChanged=(() => {/* empty function */})} = this.props;

            moveInfo[data.id] = {x, y, zoom, pan, paths, triggerPositionChanged};
            const handleMouseDown = onMovableMouseDown(data.id);

            return (
                <Component
                    {...data}
                    paths={paths}
                    x={px+x}
                    y={py+y}
                    width={width}
                    height={height}
                    relatedPositions={relatedPositions}
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
