import * as React from 'react'

import {BoundingBox} from './types'

interface Props {
    bbox: BoundingBox;
}

export function ViewElement (Element: any, data: any) {

    return class extends React.Component<Props, any> {

        constructor (props: any) {
            super (props);

            this.state = {
                bbox: this.props.bbox,
            };
        }

        public render() {
            const {bbox} = this.state;

            return (
                <g>
                    <rect {...bbox} fillOpacity={0} stroke="#000" strokeWidth={1} /> {/* TODO: remove this element; just debug */}
                    <Element
                        bbox={bbox}
                        handleMainMove={this.handleMainMove}
                        handleRelatedMove={this.handleRelatedMove}
                        handleResize={this.handleResize}
                    />
                </g>
            );
        }

        protected handleMainMove = (dx: number, dy: number) => {
            const {x, y} = this.state;
            this.setState({
                x: x + dx,
                y: y + dy,
            });
        }

        protected handleRelatedMove = () => {
            console.log("related move");
        }

        protected handleResize = (x: number, y: number, width: number, height: number) => {
            this.setState({
                bbox: { x, y, width, height }
            });
        }
    };
}
