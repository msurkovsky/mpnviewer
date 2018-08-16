import * as React from 'react';

import {createMovable} from './movable';

interface Props {
    text: string;
    x: number;
    y: number;
    triggerMouseDown?: (e: React.MouseEvent) => void;
    triggerMouseUp?: (e: React.MouseEvent) => void;
}

class CoreTextElement extends React.PureComponent<Props> {

    public render() {
        const {text, x, y} = this.props;
        const {triggerMouseDown, triggerMouseUp} = this.props;

        return (
          <text x={x} y={y} onMouseDown={triggerMouseDown} onMouseUp={triggerMouseUp}>
            {text}
          </text>
        );
    }
}

export const TextElement = createMovable<Props, {text: string}>(CoreTextElement);
