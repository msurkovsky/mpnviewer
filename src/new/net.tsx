import * as React from 'react'

export class Net extends React.Component<any, any> {

    public render () {
        const {x, y} = this.props;
        return (
            <svg {...this.props}>

                <rect {...this.props} fill="#ccc" />

                {React.Children.map(
                    this.props.children,
                    (child) => {
                        if (!React.isValidElement(child)) {
                            return;
                        }

                        return React.cloneElement(child, {x, y} as any);
                    }
                )}
            </svg>
        );
    }
}
