import {lensPath, over} from 'ramda';
import * as React from 'react';

// TODO: remove these import in the future;
import {ArcType, PlaceDataLayout} from './netmodel';
import {Net} from './netview';

import {PositionChanged} from './events';
// NOTE: stay with just fillDefaultRelatedPositions
import {fillDefaultRelatedPositions, getId} from './utils';

const state = {
    view: {
        x: 0,
        y: 0
    },
    net: fillDefaultRelatedPositions({ // TODO: REMOVE -> start with empty net
        places: {
            "a": {
                data: {
                    id: getId(),
                    name: "a",
                    type: "Bool",
                    initExpr: "",
                    dataLayout: PlaceDataLayout.Queue,
                },
                position: { x: 50, y: 50 },
                size: { width: 40, height: 40 },
            },
            "b": {
                data: {
                    id: getId(),
                    name: "b",
                    type: "Integer",
                    initExpr: "3",
                    dataLayout: PlaceDataLayout.Multiset,
                },
                position: { x: 120, y: 120 },
                size: { width: 80, height: 50 },
            },
        },
        transitions: {
            "t1": {
                data: {
                    id: getId(),
                    name: "t1",
                    guard: ["x !== null"],
                },
                position: { x: 200, y: 200 },
                size: { width: 70, height: 40 },
            }
        },
        arcs: [{
            data: {
                /* source: */
                /* destination: */
                expression: "",
                type: ArcType.SINGLE_HEADED_RO
            },
            startElementPath: ["transitions", "t1"],
            endElementPath: ["places", "b"],
            innerPoints: []
        }]
    })
};

export class App extends React.Component<any, any> { // TODO: change `any` to specific types

    constructor(props: any) {
        super(props);

        this.state = state;
    }

    public render () {
        const {net} = this.state;

        return (
            <Net x={50} y={50} width={1000} height={500}
                 data={net}
                 parentPosition={{x: 50, y: 50}}
                 paths={{
                     base: [],
                     position: ["view"]
                 }}
                 triggerPositionChanged={this.cbPositionChanged} />
        );
    }

    private cbPositionChanged = (e: PositionChanged) => {

        this.setState((old: any) => ({
            ...over(lensPath(e.path), () => ({...e.new}), old)
        }));
    }
}
