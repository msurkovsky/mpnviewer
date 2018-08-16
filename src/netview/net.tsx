import * as React from 'react'

import {Place} from './place'

export class Net extends React.Component<any, any> {

    constructor (props: any) {
        super(props);

        const net = this.props.net;
        this.state = net;
    }

    public render() {
        const {net, ...setting} = this.props;
        return (
            <svg>

                <rect {...setting} fill="#ccc" />
                {...this.renderPlaces(net.places)}
            </svg>
        );
    }

    protected renderPlaces (places: any) {

        const results = [];
        for (const key in places) {
            const {data, bbox} = places[key];

            results.push(
                 <Place key={data.id} data={data} bbox={bbox} placeMoved={this.placeMoved} />
            );
        }

        return results;
    }

    private placeMoved = (PlaceMovedEvent: ) => {

        this.setState((prevState: any) => ({
            places: {...prevState.places, [place.data.id.value]: place}
        }));
    }
}
