import * as React from 'react';

import {Position} from '../types';
import {createMovable, MouseTriggers} from './movable';

interface Data {id: string, text: string}
type Props = Data & Position & MouseTriggers;

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

export const TextElement = createMovable<Props, Data>(CoreTextElement);
