import {lensPath, over} from 'ramda';
import * as React from 'react';
import {fitSelection, TOOL_AUTO} from 'react-svg-pan-zoom'

import {ArcElement, NetElement} from './netmodel';
import {Net} from './netview';

import {PositionChanged} from './events';
import {NetTool, Toolbar} from './toolbar';
import {fillDefaultRelatedPositions, fillElementDefaultRelatedPosition} from './utils';

const state = {
    canvasToolbar: {
        value: null,
        tool: TOOL_AUTO,
    },
    netToolbar: {
        value: null,
        tool: NetTool.NONE,
    },
    net: {
        places: {},
        transitions: {},
        arcs: {},
    },
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
        const {net, canvasToolbar, netToolbar} = this.state;

        return (
            <div id="app">
            <Net ref={(netInst) => {this.netInst = netInst}}
                x={50} y={50} width={1000} height={500}
                net={net}
                canvasToolbar={canvasToolbar}
                netToolbar={netToolbar}
                triggerAddArc={this.onAddArc}
                triggerRemoveElement={this.onRemoveElement}
                triggerChangeValue={this.onChangeCanvasToolbarValue}
                triggerChangeNetToolbarValue={this.onChangeNetToolbarValue}
                triggerChangeToolbarTools={this.onChangeToolbarTools}
                triggerPositionChanged={this.onPositionChanged} />
            <Toolbar ref={(toolbarInst) => {this.toolbarInst = toolbarInst}}
                activeTool={this.state.canvasToolbar.tool}
                activeNetTool={this.state.netToolbar.tool}
                triggerFitNet={this.onFitNet}
                triggerChangeToolbarTools={this.onChangeToolbarTools}
                triggerAddPlace={this.onAddNetElement("places")}
                triggerAddTransition={this.onAddNetElement("transitions")}
                triggerSaveNet={this.onSaveNet}
                triggerLoadNet={this.onLoadNet}
            />
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

    private onAddArc = (arc: ArcElement) => {
        this.setState(({net}: any) => {
            const arcs = net.arcs;
            arcs[arc.data.id] = arc;
            return {
                net: {...over(lensPath(["arcs"]), () => ({...arcs}), net)}
            };
        });
    }

    private onRemoveElement = (category: "places" | "transitions" | "arcs") => (id: string) => {
        this.setState(({net}: any) => {
            const elements = net[category];
            delete elements[id];
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

    private onChangeCanvasToolbarValue = (value: any) => {
        this.setState(({canvasToolbar}: any) => ({canvasToolbar: {
            value,
            tool: canvasToolbar.tool,
        }}));
    }

    private onChangeNetToolbarValue = (value: any) => {
        this.setState(({netToolbar}: any) => ({netToolbar: {
            value,
            tool: netToolbar.tool,
        }}));
    }

    private onChangeToolbarTools = (canvasTool: any, netTool: NetTool | null=null) => {
        this.setState(({canvasToolbar, netToolbar}: any) => ({
            canvasToolbar: {
                value: canvasToolbar.value,
                tool: canvasTool,
            },
            netToolbar: {
                value: netToolbar.value,
                tool: netTool !== null ? netTool : netToolbar.tool
            }
        }));
    }

    private onFitNet = (evt: any) => {
        // TODO: the bounding box of the net
        this.setState(({canvasToolbar}: any) => ({canvasToolbar: {
            // TODO: I can use this to fit selection on net bounding box
            value: fitSelection(canvasToolbar.value, 40, 40, 200, 200),
            tool: canvasToolbar.tool,
        }}));
    }

    private onSaveNet = (evt: any) => {

        const data = JSON.stringify(this.state.net);
        const blob = new Blob( [ data ], {
            type: 'application/octet-stream'
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'mpnet.json');

        const event = document.createEvent('MouseEvents');
        event.initMouseEvent(
            'click', true, true, window, 1, 0, 0, 0, 0,
            false, false, false, false, 0, null);
        link.dispatchEvent(event);
    }

    private onLoadNet = (evt: any) => {
        const fr = new FileReader();
        fr.onload = () => {
            const data = fr.result as string;
            const net = JSON.parse(data);
            this.setState(() => {
                return {net: fillDefaultRelatedPositions(net)};
            });
        };
        fr.readAsText(evt.target.files[0]);
    }
}
