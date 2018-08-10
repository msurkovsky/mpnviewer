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


export function ViewElement<T extends {}> (Element: any) {

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
        }

        protected handleRelatedMove = () => {
            console.log("related move");
        }

        protected handleResize = (bbox: BoundingBox) => {
            this.setState({bbox});
        }
    };
}
