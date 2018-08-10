import * as React from 'react'

export class Net extends React.Component<any, any> {

    public render () {
        return (
            <svg {...this.props}>

                <rect {...this.props} fill="#ccc" />
                {this.props.children}
            </svg>
        );
    }
}
