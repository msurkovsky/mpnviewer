import * as React from 'react';

import {PositionChanged} from '../events';
import {PlaceData} from '../netmodel';
import {Position, Size} from '../types';
import {createMovable, MouseTriggers} from './movable';
import {TextElement} from './textelement';


type Props = PlaceData & Position & Size & MouseTriggers;

class CorePlace extends React.PureComponent<Props> {

    public render () {

        const {type, initExpr, x, y, width, height} = this.props;
        const {triggerMouseDown, triggerMouseUp} = this.props;

        const radius = height / 2;

        return (
            <g>
                <rect x={x} y={y} width={width} height={height} rx={radius} ry={radius}
                      onMouseDown={triggerMouseDown} onMouseUp={triggerMouseUp} />
                {/* TODO: get the current position from the props => don't compute it! */}
                <TextElement data={{text: type}} x={x+width} y={y+width}
                    triggerPositionChanged={this.dummyTrigger}/>
                <TextElement data={{text: initExpr}} x={x+width} y={0}
                    triggerPositionChanged={this.dummyTrigger}/>
                {/* TODO: name of the place will always be aligned to the center */}
            </g>
        );
    }

    // TODO: Propagate trigger position correctly -> pass it from props
    private dummyTrigger = (e: PositionChanged) => ({
        source: "abc",
        x: 0,
        y: 0,
    });
}

export const Place = createMovable<Props, PlaceData>(CorePlace);
