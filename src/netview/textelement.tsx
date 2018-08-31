import * as React from 'react';
import * as Utils from '../utils'

import {Position} from '../types';
import {FontSetting, FontSize} from '../visualsetting'
import {createMovable, MouseTriggers} from './movable';

interface Data {id: string, text: string}
type Props = Data & Position & MouseTriggers & {
    font: FontSetting;
    fontSize: FontSize;
    className?: string;
};

class CoreTextElement extends React.PureComponent<Props> {

    public render() {
        const {id, text, x, y, className, font, fontSize} = this.props;
        const {triggerMouseDown, triggerMouseUp} = this.props;

        const jsxText = Utils.textToSVG(id, text, font, fontSize, {
            x, y, className,
            onMouseDown: triggerMouseDown,
            onMouseUp: triggerMouseUp,
        });
        return jsxText;
    }
}

export const TextElement = createMovable<Props, Data>(CoreTextElement);
