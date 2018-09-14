import * as Ramda from 'ramda';
import * as React from 'react';
import * as Utils from '../utils';

import {PositionChanged} from '../events';
import {startMoving, stopMoving} from '../features/move';

import {ID, Path, Position} from '../types';
import {FontSetting, FontSize} from '../visualsetting';

import {CANVAS_ID} from './net';

interface Data {
    id: ID;
    text: string;
}

interface Props {
    data: Data;
    path: Path;
    zoom: number,
    pan: Position;
    anchorPosition: Position;
    position: Position;
    font: FontSetting;
    fontSize: FontSize;
    changePosition: (evt: PositionChanged) => void;
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
                    onMouseDown: this.onMouseDown,
                    onMouseUp: stopMoving
                }
            ));
        return jsxText;
    }

    private onMouseDown = (evt: MouseEvent) => {
        const {path, zoom, pan,
               position, changePosition} = this.props;
        // NOTE: Use just x, y in comparison to render method.
        //       This heps to keep the relative position info.
        const {x, y} = position;

        startMoving(CANVAS_ID, x, y, zoom, pan, path, changePosition)(evt);
    }
}
