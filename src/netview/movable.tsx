import * as React from 'react'

import {PositionChanged} from '../events'
import {Dict, Position, Size} from '../types'


export interface MouseTriggers {
    triggerMouseDown?: (e: React.MouseEvent) => void;
    triggerMouseUp?: (e: React.MouseEvent) => void;
}


export interface PositionTriggers {
    triggerPositionChanged?: (e: PositionChanged) => void;
}


type BaseComponentProps = Position & Partial<Size> & MouseTriggers & PositionTriggers & {
    path?: string[];
    relatedPositions?: Dict<Position>;
};

type Props<T extends {}> = Position & Partial<Size> & PositionTriggers & {
    path: string[];
    data: T;
    parentPosition: Position;
    relatedPositions?: Dict<Position>;
};

export function createMovable<ComponentProps extends BaseComponentProps, DataType extends {}>(
    Component: React.ComponentType<ComponentProps>) {

    return class extends React.Component<Props<DataType>, Position> {

        private mouseStartPosition: Position | null = null;
        private originPosition: Position | null = null;

        constructor(props: Props<DataType>) {
            super(props);

            const {x, y} = this.props;
            this.state = {x, y};
        }

        public render() {
            const {x, y} = this.state;
            const {path, data, parentPosition: {x: px, y: py}, width, height,
                   relatedPositions, triggerPositionChanged} = this.props;

            return (
                <Component
                    {...data}
                    path={path}
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
            const {x, y} = this.state;
            this.originPosition = {x, y};

            document.addEventListener('mousemove', this.handleMoving);
        }

        private handleMouseUp = (e: React.MouseEvent) => {
            const {path, triggerPositionChanged} = this.props;

            if (triggerPositionChanged) { // trigger position changed if registered
                const {x, y} = this.state;

                const posPath = path.concat(["position"]);
                triggerPositionChanged({
                    path: posPath,
                    new: {x, y},
                    old: {...this.originPosition!},
                });
            }

            this.originPosition = null;
            this.mouseStartPosition = this.originPosition =null;
            document.removeEventListener('mousemove', this.handleMoving);
        }

        private handleMoving = (e: MouseEvent) => {
            // This handler is registered as an event on DOM =>
            // that's why is not specified as MouseEvent

            if (this.mouseStartPosition === null) {
                return;
            }

            const dx = e.pageX - this.mouseStartPosition.x;
            const dy = e.pageY - this.mouseStartPosition.y;

            this.setState(({x, y}) => ({x: x+dx, y: y+dy}));

            this.mouseStartPosition.x = e.pageX;
            this.mouseStartPosition.y = e.pageY;
        }
    }
}
