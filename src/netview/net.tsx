import {path} from 'ramda'
import * as React from 'react';
import {ArcType} from '../netmodel';
import * as Utils from '../utils';

import {NetData} from '../netmodel';
import {Position, Size} from '../types';
import {Arc} from './arc';
import {createMovable, MouseTriggers, PositionTriggers} from './movable';
import {Place} from './place';
import {Transition} from './transition';

type Props = NetData & Position & Size & MouseTriggers & PositionTriggers & {
    paths: {
        base: string[];
        position: string[];
    };
};

class CoreNet extends React.PureComponent<Props> {

    public render() {
        const {places, transitions, arcs, width, height,
               triggerMouseDown, triggerMouseUp} = this.props;

        return (
            /* <svg transform={`translate(${x}, ${y})`} */
            /* viewBox={`${x} ${y} ${width} ${height}`} */
            /* width={width} height={height}> */
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

                <rect className="net"
                      width={width} height={height}
                      onMouseDown={triggerMouseDown} onMouseUp={triggerMouseUp} />

            <g transform="translate(200, 200)">
                {this.renderArcs(arcs)}
                {this.renderPlaces(places)}
                {this.renderTransitions(transitions)}
            </g>
            </svg>
        );
    }

    protected renderArcs(arcs: any) { // TODO: refactore

        const {places, transitions, x, y} = this.props;
        const net = {places, transitions}

        const arcComponents = [];
        for (const key of Object.keys(arcs)) {
            const {data, startElementPath, endElementPath, innerPoints} = arcs[key];

            const s = path(startElementPath, net) as {position: Position, size: Size, data: any};
            const e = path(endElementPath, net) as {position: Position, size: Size, data: any};

            const startPosition = Utils.computeCenter({
                ...Utils.v2dAdd(s.position, {x, y}), // TODO: adding position here is not the best
                ...s.size});

            let prelastPos = startPosition;
            if (innerPoints.length > 0) {
                prelastPos = innerPoints[-1];
            }

            let r = 0;
            if (endElementPath[0] === "places") { // TODO: better check
                r = e.size.height / 2;
            }
            const endPosition = Utils.rrectCollision({
                ...Utils.v2dAdd(e.position, {x,y}), // TODO: the same don't add the view position
                ...e.size}, prelastPos, r);
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

        const {triggerPositionChanged, x, y} = this.props;

        const results = [];
        for (const key of Object.keys(places)) {
            const {data, position, size, relatedPositions} = places[key];

            results.push(
                <Place
                    key={data.id}
                    paths={{ // TODO: the fixed `net` string is not the best solution
                             //       however, the parent net has position on different place
                        base: (["net", "places", key]),
                        position: ["position"],
                    }}
                    data={data}
                    parentPosition={{x, y}}
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

        const {triggerPositionChanged, x, y} = this.props;

        const results = [];
        for (const key of Object.keys(transitions)) {
            const {data, position, size, relatedPositions} = transitions[key];

            results.push(
                <Transition
                    key={data.id}
                    paths={{
                        base: ["net", "transitions", key],
                        position: ["position"],
                    }}
                    data={data}
                    parentPosition={{x, y}}
                    {...position}
                    {...size}
                    relatedPositions={relatedPositions}
                    triggerPositionChanged={triggerPositionChanged}
                />
            );
        }
        return results;
    }
}

export const Net = createMovable<Props, NetData>(CoreNet);
