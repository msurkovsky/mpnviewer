import * as Ramda from 'ramda';
import * as React from 'react';
import * as Utils from '../utils';

import {ID} from '../types';
import {FontSetting, FontSize} from '../visualsetting';

import {onMouseDown, onMouseUp, PositionableProps} from './positionable';

interface Data {
    id: ID;
    text: string;
}

type Props = PositionableProps & {
    data: Data;
    font: FontSetting;
    fontSize: FontSize;
    svgTextAttrs?: React.SVGProps<SVGTextElement>;
};

export class TextElement extends React.PureComponent<Props> {

    public static defaultProps = {
        svgTextAttrs: {}
    };

    public render() {
        const {data, anchorPosition, position,
               font, fontSize, svgTextAttrs} = this.props;

        const {x, y} = Utils.v2dAdd(anchorPosition, position);
        const jsxText = Utils.textToSVG(
            data.id,
            data.text,
            font,
            fontSize,
            Ramda.merge(
                svgTextAttrs, {
                    x, y,
                    onMouseDown: onMouseDown(this.props, []), // TODO: empty path means the path
                                                              // already contains position part
                    onMouseUp
                }
            ));
        return jsxText;
    }
}
