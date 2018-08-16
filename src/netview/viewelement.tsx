import * as React from 'react'
import * as Utils from './utils'


export interface BoundingBox {
    y: number;
    x: number;
    width: number;
    height: number;
}


// The pros has to coincide with T pros, i.e., 'bounding box' and
// 'element description' are obligatory.
interface ViewElementProps<T extends {}> {
    data: T,
    bboxes: {major: BoundingBox, minors?: {[key: string]: BoundingBox}};
    update: (element: {
        data: T,
        bboxes: {
            major: BoundingBox,
            minors?: {[key: string]: BoundingBox}
        }
    }) => void;

    handlers?: {
        dataChange?: (data: T) => void;
        batchMove?: (dx: number, dy: number) => void;
        unitMove?: (dx: number, dy: number) => void;
        resize?: (bbox: BoundingBox) => void;
    };
}

export function createViewElement<T extends {}> (Element: React.ComponentType<ViewElementProps<T> >) {

    type Props = ViewElementProps<T>;

    return class extends React.PureComponent<Props> {

        private startPosition: {x: number, y: number} | null = null;

        constructor (props: Props) {
            super(props);

            const {bbox, data} = this.props;

            this.state = {
                data,
                majorBBox: bbox,
                minorBBoxes: {},
            };
        }

        public componentDidMount() { // TODO: I'm not sure whether this is the right place to call it, maybe because it will wait when all the components will be added -> CHECK IT!

            // recompute the bounding box the children elements could change it
            const pHandleResize = this.props.handlers.resize;

            if (pHandleResize) { // Propagate the change into the parent element,
                                 // becuase the parent keeps the sate of overall
                                 // bbox.
                const bbox = this.computeCurrentBBox();
                pHandleResize(bbox);
            }
        }

        public render() {
            const {majorBBox, data} = this.state;

            return (
                <g>
                    {/* TODO: remove this element; just debug */}
                    <rect {...majorBBox} fillOpacity={0} stroke="#000" strokeWidth={1} />
                    <Element
                        data={data}
                        bbox={majorBBox}
                        handleBatchMove={this.handleBatchMove}
                        handleUnitMove={this.handleUnitMove}
                        handleResize={this.handleResize}
                    />
                </g>
            );
        }

        protected handleBatchMove = (dx: number, dy: number) => {
            const majorBBox = this.state.majorBBox;
            const {x, y, ...size} = majorBBox;

            this.setState({
                majorBBox: {
                    x: x + dx,
                    y: y + dy,
                    ...size}
            });

            // TODO: propagate change resize into the parent component
        };

        protected handleUnitMove = (dx: number, dy: number) => {
            // TODO: (?) Is there any need to propagate these changes to the parent?
            //       Unit moves are the business of the current componet
            // nothing yet
        };

        protected handleResize = (bbox: BoundingBox) => {
            this.setState({
                majorBBox: {...bbox}
            });
        };


        protected handleBatchMouseMoving =
            (startPosition: {x: number, y: number}) => (e: MouseEvent) => {

            const dx = e.pageX - startPosition.x;
            const dy = e.pageY - startPosition.y;

            const pHandleBatchMove = this.props.handleBatchMove;
            if (pHandleBatchMove) {
                pHandleBatchMove(dx, dy); // TODO: without reseting startPosition I have to pass absolute one
            }
        };

        protected handleUnitMouseMoving = (e: MouseEvent) => {
            if (this.startPosition === null) {
                return;
            }

            /* const dx = e.pageX - this.startPosition.x; */
            /* const dy = e.pageY - this.startPosition.y; */

            this.startPosition.x = e.pageX;
            this.startPosition.y = e.pageY;

            // TODO: I need somehow identify which bbox should be changed

            /*
            this.setState({
                minorBBoxes: ?
            });
            */
        }

        private computeCurrentBBox () {
            const anchorBBox = this.props.bbox;          // anchor bounding box
            const {majorBBox, minorBBoxes} = this.state; // boxes realatively positioned to anchor box

            const unifiedBBoxes = Utils.absolutizeBouningBoxes( // TODO: maybe come up with a more clear naming for absolutization, actualy it is a unification of units
                anchorBBox, [majorBBox].concat(minorBBoxes));

            return Utils.computeBoundingBox(anchorBBox, unifiedBBoxes);
        }
    };
}
