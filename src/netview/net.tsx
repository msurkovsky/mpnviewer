import * as React from 'react';

import {PositionChanged} from '../events';
import {Place} from './place';

export class Net extends React.Component<any, any> {

    constructor (props: any) {
        super(props);

        const net = this.props.net;
        this.state = net;
    }

    public render() {
        const {net, x, y, width, height} = this.props;
        return (
            <svg width={width} height={height}>

                <rect x={x} y={y} width={width} height={height} fill="#ccc" />
                {this.renderPlaces(net.places)}
            </svg>
        );
    }

    protected renderPlaces (places: any) {

        const results = [];
        for (const key of Object.keys(places)) {
            const {data, bboxes} = places[key];

            results.push(
                <Place
                    key={data.id}
                    data={data}
                    triggerPositionChanged={this.cbPositionChanged}
                    {...bboxes.major}
                />
            );
        }

        return results;
    }

    private cbPositionChanged = (e: PositionChanged) => {
        console.log("Position changed: ", e.source);
        /* this.setState((prevState: any) => ({ */
        /* places: {...prevState.places, [place.data.id.value]: place} */
        /* })); */
    }
}
