import * as React from 'react'
import {reject} from 'ramda'

interface Props<T extends {}> {
    data: T;
    x: number;
    y: number;
    width?: number;
    height?: number;
}

interface State {
    x: number;
    y: number;
}

export function createMoveable<ComponentProps extends Object>(
    // TODO: progaget the prop type from the call of the method; in the pros method => Probably the mistake is caused the wrong version of typescript!
    Component: React.ComponentType<{text: string, x: number, y: number, triggerMouseDown?: (e: MouseEvent) => void}>) {

    return class extends React.Component<Props<{text: string}>, State> {

        constructor(props: Props<{text: string}>) {
            super(props);

            const {x, y} = this.props;
            this.setState({x, y});
        }

        public render() {
            const {x, y} = this.state;
            const {width, height, data} = this.props;

            const size = reject((value) => value !== undefined, {width, height})

            return (
                <Component {...data} x={x} y={y} {...size} triggerMouseDown={this.handleMouseDown} />
            );
        }

        private startPosition: {x: number, y: number} | null = null;

        private handleMouseDown = (e: MouseEvent) => {
            this.startPosition = {
                x: e.pageX,
                y: e.pageY,
            };

            document.addEventListener('mousemove', this.handleMoving);
        }

        private handleMouseUp = (e: MouseEvent) => {
            this.startPosition = null;
            document.removeEventListener('mousemove', this.handleMoving);
        }

        private handleMoving = (e: MouseEvent) => {
            if (this.startPosition === null) {
                return;
            }

            const dx = e.pageX - this.startPosition.x;
            const dy = e.pageY - this.startPosition.y;

            this.setState(({x, y}) => ({x: x+dx, y: y+dy}));

            this.startPosition.x = e.pageX;
            this.startPosition.x = e.pageX;
        }
    }
}
