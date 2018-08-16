import * as React from 'react'

import {reject} from 'ramda'

import {createMoveable} from './moveable'

interface Props {
    text: string,
    x: number,
    y: number,
    triggerMouseDown?: (e: MouseEvent) => void;
    triggerMouseUp?: (e: MouseEvent) => void;
}

class CoreTextElement extends React.PureComponent<Props> {

    public render() {
        const {text, x, y} = this.props;
        const {triggerMouseDown: onMouseDown, triggerMouseUp: onMouseUp} = this.props;
        const events = reject((value) => value !== undefined, {onMouseDown, onMouseUp});

        return (
            <text
                x={x}
                y={y}
                {...events}
            >
                {text}
            </text>
        );
    }
}

export const TextElement = createMoveable<Props, {text: string}>(CoreTextElement);
