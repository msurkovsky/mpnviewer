import * as React from 'react';

// TODO: remove these import in the future;
import {PlaceDataLayout} from './netmodel';
import {Net} from './netview';

// NOTE: stay with just fillDefaultRelatedPositions
import {fillDefaultRelatedPositions, getId} from './utils';

const state = { // TODO: REMOVE
    net: fillDefaultRelatedPositions({
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
        arcs: []
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
            <Net net={net} x={0} y={0} width={1000} height={500} />
        );
    }
}
