import * as React from 'react'

import {BoundingBox} from './types'

export interface ViewElementProps {
    bbox: BoundingBox;
}

export function ViewElement<T extends {}> (Element: any) {

    return class extends React.Component<ViewElementProps & T, any> {

        constructor (props: any) {
            super (props);

            const {bbox, ...data} = this.props as any; // TODO: why does not work 'this.props"? (problem of spreading generic types)
                                                       // YES: it works but has to explicitely retype as any

            this.state = {...data, bbox: {...bbox}};
            console.log(this.state); // TODO: during the second render the state is enriched by x, y parameters.
        }

        public render() {
            const {bbox, ...data} = this.state;

            return (
                <g>
                    <rect {...bbox} fillOpacity={0} stroke="#000" strokeWidth={1} /> {/* TODO: remove this element; just debug */}
                    <Element
                        {...data}
                        bbox={bbox}
                        handleMainMove={this.handleMainMove}
                        handleRelatedMove={this.handleRelatedMove}
                        handleResize={this.handleResize}
                    />
                </g>
            );
        }

        protected handleMainMove = (dx: number, dy: number) => {
            const {bbox} = this.state;

            this.setState({
                bbox: {
                    x: bbox.x + dx,
                    y: bbox.y + dy,
                    width: bbox.width,
                    height: bbox.height,
                }
            });
            console.log(this.state);
        }

        protected handleRelatedMove = () => {
            console.log("related move");
        }

        protected handleResize = (bbox: BoundingBox) => {
            this.setState({bbox});
        }
    };
}
