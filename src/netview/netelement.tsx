import * as React from 'react'

export interface ViewElemProps {
    x: number;
    y: number;
    height: number;
    width: number;
    onClick?: (e: any) => void;
}

export class ViewElement extends React.Component<ViewElemProps, {}> {

    protected static defaultProps = {
        fillOpacity: 0,
        stroke: "#000",
        strokeWidth: 1,
    };

    constructor(props: ViewElemProps) {
        super(props);

        this.handleMainChildClick = this.handleMainChildClick.bind(this);
    }

    public render() {
        const {x, y, width, height, onClick, ...other} = this.props;

        return (
            <g>
                <rect {...other} {...{x, y, width, height}} />

                {/*this.props.children*/}

                {React.Children.map(
                    this.props.children,
                    (child: React.ReactElement<ViewElemProps>) => {
                        if (!React.isValidElement(child)) {
                            return;
                        }

                        return React.cloneElement(child, {onClick: this.handleMainChildClick});
                    }
                )}

                {/* TODO: reuse this with group moving, i.e., if move with place all connected things moves with it */}
                {/*React.Children.map(
                    this.props.children,
                    (child: React.ReactElement<ViewPlaceProps>) => {
                        if (!React.isValidElement(child)) {
                            return;
                        }

                        console.log(child.props);
                        const elemX = x + 10;
                        const elemY = y + 20;
                        return React.cloneElement(child, {x: elemX, y: elemY});
                    })*/}
            </g>
        );
    }

    protected handleMainChildClick (e: any) {
        console.log("handle main");
    }
}
