import * as React from 'react'

import {Position, Size} from '../types'
import {PositionChanged} from '../events'


export interface MouseTriggers {
    triggerMouseDown?: (e: React.MouseEvent) => void;
    triggerMouseUp?: (e: React.MouseEvent) => void;
}


interface Props<T extends {}> { // TODO: compose it from `Position` `Size`
    data: T;
    x: number;
    y: number;
    width?: number;
    height?: number;
    triggerPositionChanged?: (e: PositionChanged) => void;
}

type BaseComponentProps = Position & Partial<Size> & MouseTriggers;

export function createMovable<ComponentProps extends BaseComponentProps, DataType extends {}>(

    Component: React.ComponentType<ComponentProps>) {

    return class extends React.Component<Props<DataType>, Position> {

        constructor(props: Props<DataType>) {
            super(props);

            const {x, y} = this.props;
            this.setState({x, y});
        }

        public render() {
            const {x, y} = this.state;
            const {width, height, data} = this.props;

            return (
                <Component
                    {...data}
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    triggerMouseDown={this.handleMouseDown}
                    triggerMouseUp={this.handleMouseUp}
                />
            );
        }

        private startPosition: {x: number, y: number} | null = null;

        private handleMouseDown = (e: React.MouseEvent) => {
            this.startPosition = {
                x: e.pageX,
                y: e.pageY,
            };

            document.addEventListener('mousemove', this.handleMoving);
        }

        private handleMouseUp = (e: React.MouseEvent) => {
            this.startPosition = null;
            // TODO: propagate state change further to parents;; similarly as in Net
            const {data, triggerPositionChanged} = this.props;

            if (triggerPositionChanged) { // trigger position changed if registered
                triggerPositionChanged({
                    source: data,
                    old: {x: -1, y: -1}, // TODO: what is old position, the last one or the one at start moving?
                    new: {x: -1, y: -1}, // TODO: compute according to the old one
                });
            }
            document.removeEventListener('mousemove', this.handleMoving);
        }

        private handleMoving = (e: MouseEvent) => {
            // This handler is registered as an event on DOM =>
            // that's why is not specified as MouseEvent

            if (this.startPosition === null) {
                return;
            }

            const dx = e.pageX - this.startPosition.x;
            const dy = e.pageY - this.startPosition.y;

            this.setState(({x, y}) => ({x: x+dx, y: y+dy}));

            this.startPosition.x = e.pageX;
            this.startPosition.y = e.pageY;
        }
    }
}
