import * as Ramda from 'ramda';
import * as React from 'react';
import {fitSelection, TOOL_AUTO} from 'react-svg-pan-zoom';

import {NetElementSettingForm} from './components/types';

import {isArc, isPlace, isTransition,
        NetCategory, NetElement} from './netmodel';
import {Net} from './netview';

import {NetPropertyChanged} from './events';

import {ArcSetting, PlaceSetting,
        ResizableSetting, TransitionSetting} from './components';

import {NetTool, Toolbar} from './toolbar';
import {Resizable} from './types';
import {fillDefaultRelatedPositions,
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
        let resizeForm = null;
        if (selected.path !== null) {
            const element = Ramda.path(selected.path, net);
            if (element) {
                let SettingForm: NetElementSettingForm;

                const netElement = element as NetElement;
                if (isPlace(netElement)) {
                    SettingForm = PlaceSetting;
                } else if (isTransition(netElement)) {
                    SettingForm = TransitionSetting;
                } else if (isArc(netElement)) {
                    SettingForm = ArcSetting;
                } else {
                    throw new Error("Invalid selected element");
                }

                if (isPlace(netElement) || isTransition(netElement)) {
                    resizeForm = <ResizableSetting
                        size={(netElement as Resizable).size}
                        path={selected.path.concat(["size"])}
                        triggerChangesSubmit={this.onChangeNetProperty} />
                }

                settingForm = <SettingForm
                    data={netElement.data}
                    key={`setting-${netElement.type}-${netElement.data.id}`}
                    path={selected.path.concat(["data"])}
                    triggerChangesSubmit={this.onChangeNetProperty} />
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
                triggerAddArc={this.onAddNetElement("arcs")}
                triggerRemoveElement={this.onRemoveNetElement}
                triggerChangeValue={this.onChangeCanvasToolbarValue}
                triggerChangeNetToolbarValue={this.onChangeNetToolbarValue}
                triggerChangeToolbarTools={this.onChangeToolbarTools}
                triggerPositionChanged={this.onChangeNetProperty} />
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
                triggerPositionChanged={this.onChangeNetProperty} />
            {settingForm}
            {resizeForm}
            </div>
        );
    }

    private onAddNetElement = (category: NetCategory) => (element: NetElement) => {
        this.setState(({net}: any) => {
            const filledElement = fillElementDefaultRelatedPosition(element, net);
            return {
                net: {...Ramda.over(
                    Ramda.lensPath([category, element.data.id]),
                    () => filledElement,
                    net
                )}
            };
        });
    }

    private onRemoveNetElement = (category: NetCategory) => (id: string) => {
        this.setState(({net}: any) => {
            const elements = net[category];
            delete elements[id];
            return {
                net: {...Ramda.over(
                    Ramda.lensPath([category]),
                    () => ({...elements}),
                    net
                )}
            };
        });
    }

    private onChangeNetProperty = (evt: NetPropertyChanged) => {
        this.setState(({net}: any) => ({
            net: {...Ramda.over(
                Ramda.lensPath(evt.path),
                () => ({...evt.value}),
                net
            )}
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

    private onSelect = (path: string[] | null) => () => {
        if (this.state.canvasToolbar.tool !== TOOL_AUTO) {
            return;
        }

        this.setState(() => ({selected: {path}}));
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
}
