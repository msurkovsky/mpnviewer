import * as React from 'react';

import {PositionChanged} from '../events';
import {Position, Size} from '../types';
import {PlaceData} from '../netmodel';
import {createMovable, MouseTriggers} from './movable';
import {TextElement} from './textelement';


type Props = PlaceData & Position & Size & MouseTriggers;

class CorePlace extends React.PureComponent<Props> {

    public render () {

        const {id, type, initExpr, x, y, width, height} = this.props;
        const {triggerMouseDown, triggerMouseUp} = this.props;

        const radius = height / 2;

        return (
            <g>
                <rect x={x} y={y} width={width} height={height} rx={radius} ry={radius}
                      onMouseDown={triggerMouseDown} onMouseUp={triggerMouseUp} />
                {/* TODO: get the current position from the props => don't compute it! */}
                {/* TODO: Propagate trigger position correctly -> pass it from props */}
                <TextElement data={{text: type}} x={x+width} y={y+width}
                    triggerPositionChanged={(e: PositionChanged) => ({source: id, x: 0, y: 0}) }/>
                <TextElement data={{text: initExpr}} x={x+width} y={0}
                    triggerPositionChanged={(e: PositionChanged) => ({source: id, x: 0, y: 0}) }/>
                {/* TODO: name of the place will always be aligned to the center */}
            </g>
        );
    }
}

export const Place = createMovable<Props, PlaceData>(CorePlace);
