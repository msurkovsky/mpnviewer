import * as React from 'react'
import * as Utils from '../utils'

import {PositionChanged} from '../events'
import {Dict, Position, Size, Vector2d} from '../types'

import {CanvasContext, CanvasCtxData} from './net'

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

export function createMovable<ComponentProps extends BaseComponentProps, DataType extends {}>(
    Component: React.ComponentType<ComponentProps>) {


    class Moveable extends React.Component<Props<DataType> & CanvasCtxData, Position> {

        private pointerElementDiff: Vector2d | null = null;

        public render() {
            const {paths, data,
                   parentPosition: {x: px, y: py}, x, y, width, height,
                   relatedPositions, triggerPositionChanged} = this.props;

            return (
                <Component
                    {...data}
                    paths={paths}
                    x={px+x}
                    y={py+y}
                    width={width}
                    height={height}
                    relatedPositions={relatedPositions}
                    triggerMouseDown={this.handleMouseDown}
                    triggerMouseUp={this.handleMouseUp}
                    triggerPositionChanged={triggerPositionChanged}
                />
            );
        }

        private handleMouseDown = (e: React.MouseEvent) => {
            const {x, y, zoom, pan} = this.props;
            this.pointerElementDiff = Utils.v2dSub({
                x: (e.clientX - pan.x) / zoom,
                y: (e.clientY - pan.y) / zoom
            }, { x, y });

            document.addEventListener('mousemove', this.handleMoving);
        }

        private handleMouseUp = (e: React.MouseEvent) => {
            e.preventDefault();

            this.pointerElementDiff = null;
            document.removeEventListener('mousemove', this.handleMoving);
        }

        private handleMoving = (e: MouseEvent) => {
            // This handler is registered as an event on DOM =>
            // that's why is not specified as React.MouseEvent

            if (this.pointerElementDiff === null) {
                return;
            }
            e.preventDefault();

            const {x, y, pan, zoom, paths, triggerPositionChanged} = this.props;

            const newPos = Utils.v2dSub({
                x: (e.clientX - pan.x) / zoom,
                y: (e.clientY - pan.y) / zoom}, this.pointerElementDiff);

            if (triggerPositionChanged) { // trigger position changed if registered

                triggerPositionChanged({
                    path: paths.base.concat(paths.position),
                    new: newPos,
                    old: {x, y},
                });
            }
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
