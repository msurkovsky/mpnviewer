import {lensPath, over, path} from 'ramda'
import * as React from 'react';
import * as Utils from '../utils';

import {PositionChanged} from '../events';
import {Position, Size} from '../types'
import {Arc} from './arc'
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
                {this.renderArcs(net.arcs)}
                {this.renderPlaces(net.places)}
                {this.renderTransitions(net.transitions)}
            </svg>
        );
    }

    protected renderArcs(arcs: any) {

        const arcComponents = [];
        for (const key of Object.keys(arcs)) {
            const {data, startElementPath, endElementPath, innerPoints} = arcs[key];

            const net = this.state;

            const s = path(startElementPath, net) as {position: Position, size: Size, data: any};
            const e = path(endElementPath, net) as {position: Position, size: Size, data: any};

            // TODO: add get center from bounding box to utils
            const startPosition = {
                x: s.position.x + s.size.width / 2,
                y: s.position.y + s.size.height / 2,
            };

            let prelastPos = startPosition;
            if (innerPoints.length > 0) {
                prelastPos = innerPoints[-1];
            }

            let r = 0;
            if (endElementPath[0] === "places") { // TODO: better check
                r = e.size.height / 2;
            }
            const endPosition = Utils.rrectCollision({...e.position, ...e.size}, prelastPos, r);
            const points = [startPosition, ...innerPoints, endPosition];

            arcComponents.push(
                <Arc
                   key={`${s.data.id}-${e.data.id}`}
                   points={points}
                   expression={data.expression}
                />
            );
        }

        return arcComponents;
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
    }
}
