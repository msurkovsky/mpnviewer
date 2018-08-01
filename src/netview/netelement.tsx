import * as React from 'react'

import {PlaceProps} from '../netmodel/place'
import {Position, Size} from './types'

interface Props {
    position: Position;
    size: Size;
    /* children: React.ReactElement<Place>[] */
}

export class ViewElement extends React.Component<Props, {}> {

    public render() {
        const {x, y} = this.props.position;
        const {width, height} = this.props.size;

        console.log(this.props.children);
        return (
            <g>
                <rect x={x} y={y} width={width} height={height} fill="white" stroke="black" strokeWidth={2} />
                {React.Children.map(
                     this.props.children,
                     (child: React.ReactElement<PlaceProps>) => {
                        if (!React.isValidElement(child)) { return; }

                         console.log(child.props);
                        const elemX = x + (child.props.cx as number);
                        const elemY = y + (child.props.cy as number);
                        return React.cloneElement(child, {cx: elemX, cy: elemY});
                     })
                }
            </g>
        );
    }
}
