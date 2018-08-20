import {lensPath, over} from 'ramda'
import * as React from 'react';

import {PositionChanged} from '../events';
import {Place} from './place';
import {Transition} from './transition';

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

                <rect className="net" x={x} y={y} width={width} height={height} />
                {this.renderPlaces(net.places)}
                {this.renderTransitions(net.transitions)}
            </svg>
        );
    }

    protected renderPlaces (places: any) {

        const results = [];
        for (const key of Object.keys(places)) {
            const {data, position, size, relatedPositions} = places[key];

            results.push(
                <Place
                    key={data.id}
                    paths={{
                        base: ["places", key],
                        position: ["position"],
                    }}
                    data={data}
                    parentPosition={{x: 0, y: 0}}
                    {...position}
                    {...size}
                    relatedPositions={relatedPositions}
                    triggerPositionChanged={this.cbPositionChanged}
                />
            );
        }

        return results;
    }

    protected renderTransitions (transitions: any) {

        const results = [];
        for (const key of Object.keys(transitions)) {
            const {data, position, size, relatedPositions} = transitions[key];

            results.push(
                <Transition
                    key={data.id}
                    paths={{
                        base: ["transitions", key],
                        position: ["position"],
                    }}
                    data={data}
                    parentPosition={{x: 0, y: 0}}
                    {...position}
                    {...size}
                    relatedPositions={relatedPositions}
                    triggerPositionChanged={this.cbPositionChanged}
                />
            );
        }
        return results;
    }

    private cbPositionChanged = (e: PositionChanged) => {

        this.setState((oldNet: any) => ({
            ...over(lensPath(e.path), () => ({...e.new}), oldNet)
        }));
        console.log(this.state);
    }
}
