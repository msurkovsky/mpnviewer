import {lensPath, over} from 'ramda';
import * as React from 'react';
import {fitSelection, TOOL_AUTO} from 'react-svg-pan-zoom'

// TODO: remove these import in the future;
import {ArcType, NetElement, PlaceDataLayout} from './netmodel';
import {Net} from './netview';

import {PositionChanged} from './events';
import {NetTool, Toolbar} from './toolbar';
// NOTE: stay with just fillDefaultRelatedPositions
import {fillDefaultRelatedPositions, fillElementDefaultRelatedPosition, getId} from './utils';

const state = {
    canvasToolbar: {
        value: null,
        tool: TOOL_AUTO,
    },
    netToolbar: {
        tool: NetTool.NONE
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

    private netInst: Net | null = null;
    private toolbarInst: Toolbar | null = null;

    constructor(props: any) {
        super(props);

        this.state = state;
    }

    public componentDidMount () {
        if (this.toolbarInst === null || this.netInst === null) {
            throw Error("Getting reference on toolbar and net instance failed.");
        }

        this.toolbarInst.setViewer(this.netInst.viewerInst);
    }

    public render () {
        const {net, canvasToolbar: ctState} = this.state;

        return (
            <div id="app">
            <Toolbar ref={(toolbarInst) => {this.toolbarInst = toolbarInst}}
                activeTool={this.state.canvasToolbar.tool}
                activeNetTool={this.state.netToolbar.tool}
                triggerFitNet={this.onFitNet}
                triggerChangeToolbarTools={this.onChangeToolbarTools}
                triggerAddPlace={this.onAddNetElement("places")}
                triggerAddTransition={this.onAddNetElement("transitions")}
            />
            <Net ref={(netInst) => {this.netInst = netInst}}
                x={50} y={50} width={1000} height={500}
                net={net}
                toolbarState={ctState}
                triggerChangeValue={this.onChangeToolbarValue}
                triggerChangeToolbarTools={this.onChangeToolbarTools}
                triggerPositionChanged={this.onPositionChanged} />
            </div>
        );
    }

    private onAddNetElement = (category: "places" | "transitions") => (element: NetElement) => {
        this.setState(({net}: any) => {
            const elements = net[category];
            elements[element.data.id] = fillElementDefaultRelatedPosition(element, category);
            return {
                net: {...over(lensPath([category]), () => ({...elements}), net)}
            };
        });
    }

    private onPositionChanged = (e: PositionChanged) => {
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

    private onChangeToolbarTools = (canvasTool: any, netTool: NetTool | null=null) => {
        this.setState(({canvasToolbar, netToolbar}: any) => ({
            canvasToolbar: {
                value: canvasToolbar.value,
                tool: canvasTool,
            },
            netToolbar: {
                tool: netTool !== null ? netTool : netToolbar.tool
            }
        }));
        console.log(this.state);
    }

    private onFitNet = (evt: any) => {
        // TODO: the bounding box of the net
        this.setState(({canvasToolbar}: any) => ({canvasToolbar: {
            // TODO: I can use this to fit selection on net bounding box
            value: fitSelection(canvasToolbar.value, 40, 40, 200, 200),
            tool: canvasToolbar.tool,
        }}));
    }
}
