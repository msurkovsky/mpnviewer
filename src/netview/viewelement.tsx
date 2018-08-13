import * as React from 'react'


interface ViewElementData {
    bbox: BoundingBox;
}


export interface BoundingBox {
    y: number;
    x: number;
    width: number;
    height: number;
}


export function createViewElement<T extends {}> (Element: any) {

    type Props = ViewElementData & T;
    type State = Props;

    return class extends React.Component<Props, State> {

        constructor (props: Props) {
            super(props);

            const {bbox, ...data} = this.props as any; // FIXME: with a new version of typescript remove casting
            this.state = {
                bbox,   // state of the group's  bounding box
                ...data // State of the inner object data, modified via the handler;
                        // view element keeps the sate but know nothing about it.
            };
        }

        public render() {
            const {bbox, ...data} = this.state as any; // FIXME: the same problem as before

            return (
                <g>
                    <rect {...bbox} fillOpacity={0} stroke="#000" strokeWidth={1} /> {/* TODO: remove this element; just debug */}
                    <Element
                        {...data}
                        bbox={bbox}
                        handleGroupMove={this.handleGroupMove}
                        handleResize={this.handleResize}
                    />
                </g>
            );
        }

        public handleGroupMove = (dx: number, dy: number) => {
            const {bbox, ...data} = this.state as any; // FIXME: get rid of any
            const {x, y, ...size} = bbox;

            this.setState({
                ...data,
                bbox: {
                    x: x + dx,
                    y: y + dy,
                    ...size}
            });
        }

        public handleIndividualMove = (dx: number, dy: number) => {
            // nothing yet
        }

        public handleResize = (newBbox: BoundingBox) => {
            const {bbox, ...data} = this.state as any; // FIXME: get rid of any

            this.setState({
                ...data,
                bbox: newBbox
            });
        }
    };
}
