import * as React from 'react';

export class Place extends React.Component {

    public render () {
        return (
            <circle cx={50} cy={50} r={40} stroke="green" stroke-width={4} fill="yellow" />
        );
    }
}
