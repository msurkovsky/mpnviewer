import {path} from 'ramda'
import * as React from 'react';
import {ReactSVGPanZoom} from 'react-svg-pan-zoom';
import {ArcType} from '../netmodel';
import * as Utils from '../utils';

import {Position, Size} from '../types'
import {Arc} from './arc'
import {Place} from './place';
import {Transition} from './transition';

export const CanvasContext = React.createContext({zoom: 1.0});

export class Net extends React.Component<any, any> {

    public state = {
        zoom: 1.0
    };
    public render() {
        const {net, width, height} = this.props;

        return (
            <CanvasContext.Provider value={{zoom: this.state.zoom}}>
            <ReactSVGPanZoom width={width} height={height} onZoom={this.onZoom} background="#f00">
            <svg width={width} height={height}>
                <defs>
                    <marker id={ArcType.SINGLE_HEADED} viewBox="0 0 10 10" refX="8" refY="5"
                            markerWidth="10" markerHeight="8"
                            orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 Z" />
                    </marker>

                    <marker id={ArcType.DOUBLE_HEADED} viewBox="0 0 20 10" refX="18" refY="5"
                            markerWidth="18" markerHeight="8"
                            orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 Z" />
                        <path d="M 10 0 L 20 5 L 10 10 Z" />
                    </marker>

                    <marker id={ArcType.SINGLE_HEADED_RO} viewBox="0 0 10 10" refX="8" refY="5"
                            markerWidth="10" markerHeight="8"
                            orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 Z" fill="#fff" stroke="#000" strokeWidth="1.5"/>
                    </marker>

                    <marker id={ArcType.DOUBLE_HEADED_RO} viewBox="0 0 20 10" refX="18" refY="5"
                            markerWidth="18" markerHeight="8"
                            orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 Z" fill="#fff" stroke="#000" strokeWidth="1.5"/>
                        <path d="M 10 0 L 20 5 L 10 10 Z" fill="#fff" stroke="#000" strokeWidth="1.5" />
                    </marker>
                </defs>

                <rect className="net" width={width} height={height} />
                {this.renderArcs(net.arcs)}
                {this.renderPlaces(net.places)}
                {this.renderTransitions(net.transitions)}
            </svg>
            </ReactSVGPanZoom>
            </CanvasContext.Provider>
        );
    }

    protected renderArcs(arcs: any) { // TODO: refactore

        const net = this.props.net;

        const arcComponents = [];
        for (const key of Object.keys(arcs)) {
            const {data, startElementPath, endElementPath, innerPoints} = arcs[key];

            const s = path(startElementPath, net) as {position: Position, size: Size, data: any};
            const e = path(endElementPath, net) as {position: Position, size: Size, data: any};

            const startPosition = Utils.computeCenter({...s.position, ...s.size});

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
                   type={data.type}
                />
            );
        }

        return arcComponents;
    }

    protected renderPlaces (places: any) {

        const triggerPositionChanged = this.props.triggerPositionChanged;

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
                    triggerPositionChanged={triggerPositionChanged}
                />
            );
        }

        return results;
    }

    protected renderTransitions (transitions: any) {

        const triggerPositionChanged = this.props.triggerPositionChanged;

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
                    triggerPositionChanged={triggerPositionChanged}
                />
            );
        }
        return results;
    }

    protected onZoom = (e: any) => {
        this.setState({zoom: e.a});
    }
}
