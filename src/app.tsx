import {lensPath, lensProp, over, path as ramdaPath} from 'ramda';
import * as React from 'react';
import {fitSelection, TOOL_AUTO} from 'react-svg-pan-zoom'

import {ArcElement,
        NetCategory,
        NetElement,
        PlaceElement,
        TransitionElement} from './netmodel';
import {Net} from './netview';

import {ElementValueChanged, PositionChanged} from './events';

import {ArcSetting} from './arcsetting';
import {PlaceSetting} from './placesetting';
import {TransitionSetting} from './transitionsetting';

import {NetTool, Toolbar} from './toolbar';
import {fillArcsDefaultRelatedPosition,
        fillDefaultRelatedPositions,
        fillElementDefaultRelatedPosition} from './utils';

const state = {
    selected: {
        path: null,
    },
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
        const {selected, net, canvasToolbar, netToolbar} = this.state;

        let settingForm = null;
        if (selected.path !== null) {
            if (selected.path[0] === "places") {
                const place = {...ramdaPath(selected.path, this.state.net)} as PlaceElement;
                settingForm = <PlaceSetting
                    {...place.data}
                    {...place.size}
                    path={selected.path}
                    key={`setting-place-${place.data.id}`}
                    triggerChangesSubmit={this.onChangeElementValue} />;
            } else if (selected.path[0] === "transitions") {
                const transition = {...ramdaPath(
                    selected.path, this.state.net)} as TransitionElement;
                settingForm = <TransitionSetting
                    {...transition.data}
                    {...transition.size}
                    path={selected.path}
                    key={`setting-trans-${transition.data.id}`}
                    triggerChangesSubmit={this.onChangeElementValue} />;
            } else if (selected.path[0] === "arcs") {
                const arc = {...ramdaPath(
                    selected.path, this.state.net)} as ArcElement;
                settingForm = <ArcSetting
                    {...arc.data}
                    path={selected.path}
                    key={`setting-arc${arc.data.id}`}
                    triggerChangesSubmit={this.onChangeElementValue} />;
            }
        }

        return (
            <div id="app">
            <Net ref={(netInst) => {this.netInst = netInst}}
                x={50} y={50} width={1600} height={700}
                net={net}
                canvasToolbar={canvasToolbar}
                netToolbar={netToolbar}
                triggerSelect={this.onSelect}
                triggerAddArc={this.onAddArc}
                triggerRemoveElement={this.onRemoveNetElement}
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
                triggerRemovePlace={this.onRemoveNetElement("places")}
                triggerRemoveTransition={this.onRemoveNetElement("transitions")}
                triggerSaveNet={this.onSaveNet}
                triggerLoadNet={this.onLoadNet}
                triggerPositionChanged={this.onPositionChanged} />
            {settingForm}
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
                net: fillArcsDefaultRelatedPosition({...over(lensPath(["arcs"]), () => ({...arcs}), net)})
            };
        });
    }

    private onRemoveNetElement = (category: NetCategory) => (id: string) => {
        this.setState(({net}: any) => {
            const elements = net[category];
            delete elements[id];
            return {
                net: {...over(lensPath([category]), () => ({...elements}), net)}
            };
        });
    }

    private onSelect = (path: string[] | null) => () => {
        if (this.state.canvasToolbar.tool !== TOOL_AUTO) {
            return;
        }

        this.setState(() => ({selected: {path}}));
    }

    private onPositionChanged = (e: PositionChanged) => {
        this.setState(({net}: any) => ({
            net: {...over(lensPath(e.path), () => ({...e.new}), net)}
        }));
    }

    private onChangeElementValue = (evt: ElementValueChanged) => {

        this.setState(({net}: any) => {
            const keys = Object.keys(evt.value);
            let o = ramdaPath(evt.path, net);
            for (const key of keys) {
                o = over(lensProp(key), () => ({...evt.value[key]}), o);
            }

            return {
                net: over(lensPath(evt.path), () => ({...o}), net),
            };
        });
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

        const data = JSON.stringify(this.state.net, null, 2);
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
            this.setState(() => ({net: fillDefaultRelatedPositions(net)}));
        };
        fr.readAsText(evt.target.files[0]);
    }
}
