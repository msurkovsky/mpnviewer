import {lensPath, over} from 'ramda';
import * as React from 'react';
import {fitSelection, TOOL_NONE} from 'react-svg-pan-zoom'

// TODO: remove these import in the future;
import {ArcType, PlaceDataLayout} from './netmodel';
import {Net} from './netview';

import {PositionChanged} from './events';
import {Toolbar} from './toolbar';
// NOTE: stay with just fillDefaultRelatedPositions
import {fillDefaultRelatedPositions, getId} from './utils';

const state = {
    canvasToolbar: {
        value: null,
        tool: TOOL_NONE,
    },
    net: fillDefaultRelatedPositions({ // TODO: REMOVE -> start with empty net
        places: {
            "a": {
                data: {
                    id: getId(),
                    name: "a",
                    type: "Bool",
                    initExpr: "",
                    dataLayout: PlaceDataLayout.QUEUE,
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
                    dataLayout: PlaceDataLayout.MULTISET,
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
        const {net, canvasToolbar: ctState} = this.state;

        return (
            <div id="app">
            <Toolbar
                activeTool={this.state.canvasToolbar.tool}
                triggerFitNet={this.onFitNet}
                triggerToolChange={this.onToolChange}
                triggerAddPlace={this.onAddPlace}
            />
              <Net x={50} y={50} width={1000} height={500}
                  net={net}
                  toolbarState={ctState}
                  triggerChangeValue={this.onChangeToolbarValue}
                  triggerChangeTool={this.onToolChange}
                  triggerPositionChanged={this.cbPositionChanged} />
            </div>
        );
    }

    private cbPositionChanged = (e: PositionChanged) => {
        this.setState(({net}: any) => ({
            net: {...over(lensPath(e.path), () => ({...e.new}), net)}
        }));
    }

    private onChangeToolbarValue = (value: any) => {
        this.setState(({canvasToolbar}: any) => ({canvasToolbar: {
            value,
            tool: canvasToolbar.tool,
        }}));
    }

    private onFitNet = (evt: any) => {
        // TODO: the bounding box of the net
        this.setState(({canvasToolbar}: any) => ({canvasToolbar: {
            value: fitSelection(canvasToolbar.value, 40, 40, 200, 200), // TODO: I can use this to fit selection on net bounding box
            tool: canvasToolbar.tool,
        }}));
    }

    private onToolChange = (tool: any) => (evt: any) => {
        this.setState(({canvasToolbar}: any) => ({canvasToolbar: {
            value: canvasToolbar.value,
            tool,
        }}));
    }

    private onAddPlace = () => {
        console.log("addPlace");
    }
}
