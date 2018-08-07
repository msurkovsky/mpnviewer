import * as React from 'react'

export interface ViewElemProps {
    x: number;
    y: number;
    height: number;
    width: number;
}

export class ViewElement extends React.Component<ViewElemProps, ViewElemProps /* TODO: don't use the same type for state */> {

    /* protected static defaultProps = { */
    /* fillOpacity: 0, */
    /* stroke: "#000", */
    /* strokeWidth: 1, */
    /* }; */

    public static computeBoundingBox (elements: any[]) {
        let {x, y, width, height} = elements[0];
        for (let i = 1; i < elements.length; i++) {
            const {ex, ey, ew, eh} = elements[i];
            if (ex < x) {
                x = ex;
            }
            if (ey < y) {
                y = ey;
            }

            if (ew > width) {
                width = ew;
            }

            if (eh > height) {
                height = eh;
            }
        }
        return {x, y, width, height};
    }

    private startX: number;
    private startY: number;

    public constructor(props: any) {
        super(props);

        const {x, y, width, height} = this.props;
        this.state = {x, y, width, height};
    }

    public render() {
        const {x, y, width, height} = this.state;

        return (
            <g>
                <rect {...{x, y, width, height}} {...{fillOpacity: 0, stroke: "#000", strokeWidth: 1}}/>

                {React.Children.map(
                    this.props.children,
                    (child: any) => {
                        if (!React.isValidElement(child)) {
                            return;
                        }

                        // TODO: I have to keep relative distances
                        const xx = this.state.x + (child.props as any).relX; {/* this is contained in its state not props */}
                        const yy = this.state.y + (child.props as any).relY;
                        return React.cloneElement(child, {onClick: this.handleMainChildClick, onMouseDown: this.handleOnMouseDown, x: xx, y: yy} as any);
                    }
                )}
            </g>
        );
    }

    protected handleOnMouseDown = (e: any) => {

        this.startX = this.state.x;
        this.startY = this.state.y;
        console.log("handleOnMouseDown", e, this.startX, this.startY);
        /* this.startX = e.x; */
        /* this.startY = e.y; */
    }

    protected handleMainChildClick = (e: any) => {

        this.setState({
            x: this.state.x + 10,
            y: this.state.y + 20,
        });
    }
}
