import * as React from 'react';

interface INetProps {
    width: number;
    height: number;
}

export class Net extends React.Component<INetProps, {}> {

    public render () {
        return (
            <svg width={this.props.width} height={this.props.height}>
                {this.props.children}
            </svg>
        );
    }
}
