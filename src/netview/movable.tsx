import * as React from 'react'

import {PositionChanged} from '../events'
import {Dict, Position, Size} from '../types'

import {CanvasContext} from './net'

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


    class Moveable extends React.Component<Props<DataType> & {zoom: number}, Position> {

        private mouseStartPosition: Position | null = null;

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
            this.mouseStartPosition = {
                x: e.pageX,
                y: e.pageY,
            };

            document.addEventListener('mousemove', this.handleMoving);
        }

        private handleMouseUp = (e: React.MouseEvent) => {
            e.preventDefault();

            this.mouseStartPosition = null;
            document.removeEventListener('mousemove', this.handleMoving);
        }

        private handleMoving = (e: MouseEvent) => {
            // This handler is registered as an event on DOM =>
            // that's why is not specified as React.MouseEvent

            if (this.mouseStartPosition === null) {
                return;
            }
            e.preventDefault();

            const dx = (e.pageX - this.mouseStartPosition.x) / this.props.zoom;
            const dy = (e.pageY - this.mouseStartPosition.y) / this.props.zoom;

            const {x, y, paths, triggerPositionChanged} = this.props;

            if (triggerPositionChanged) { // trigger position changed if registered

                triggerPositionChanged({
                    path: paths.base.concat(paths.position),
                    new: {x: x+dx, y: y+dy},
                    old: {x, y},
                });
            }

            this.mouseStartPosition.x = e.pageX;
            this.mouseStartPosition.y = e.pageY;
        }
    }

    return class extends React.Component<Props<DataType>, any> {
        public render() {
            return (
                <CanvasContext.Consumer>
                    {({zoom}) => <Moveable {...this.props} zoom={zoom}/>}
                </CanvasContext.Consumer>
            );
        }
    }
}
