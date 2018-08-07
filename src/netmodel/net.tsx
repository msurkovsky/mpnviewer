import * as React from 'react';

interface INetProps {
    width: number;
    height: number;
}

export class Net extends React.Component<INetProps, {}> {

    public render () {
        return (
            <svg width={this.props.width} height={this.props.height}>
                <rect {...{x: 0, y: 0, width: this.props.width, height: this.props.height}} fill="#ccc" />
                {this.props.children}
            </svg>
        );
    }
}
