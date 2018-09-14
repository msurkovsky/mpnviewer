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

import {NetTool, ToolbarType} from './toolbar';
import {ID, Path, Resizable} from './types';
import {fillDefaultRelatedPositions,
        fillElementDefaultRelatedPosition} from './utils';


export interface AppEvents {
    onSaveNet: (fileName: string) => void;
    onLoadNet: (file: File) => void;
    onFitNet: () => void;
    onSelectNetElement: (path: Path | null) => () => void;
    onAddNetElement: (category: NetCategory) => (element: NetElement) => void;
    onRemoveNetElement: (category: NetCategory) => (id: ID) => void;
    onChangeNetProperty: (evt: NetPropertyChanged) => void;
    onChangeToolbarValue: (toolbar: ToolbarType) => (value: any) => void;
    onChangeToolbarsTool: (canvasTool: any, netTool: NetTool | null) => void;
}

const initState = {
    selected: {
        path: null as Path | null,
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

    public state = initState;

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
                        submitChanges={this.onChangeNetProperty} />
                }

                settingForm = <SettingForm
                    data={netElement.data}
                    key={`setting-${netElement.type}-${netElement.data.id}`}
                    path={selected.path.concat(["data"])}
                    submitChanges={this.onChangeNetProperty} />
            }
        }

        return (
            <div id="app">
                <Net
                    width={1600} height={700}
                    net={net}
                    canvasToolbarState={canvasToolbar}
                    netToolbarState={netToolbar}
                    onSaveNet={this.onSaveNet}
                    onLoadNet={this.onLoadNet}
                    onFitNet={this.onFitNet}
                    onSelectNetElement={this.onSelectNetElement}
                    onAddNetElement={this.onAddNetElement}
                    onRemoveNetElement={this.onRemoveNetElement}
                    onChangeNetProperty={this.onChangeNetProperty}
                    onChangeToolbarValue={this.onChangeToolbarValue}
                    onChangeToolbarsTool={this.onChangeToolbarsTool} />
                {settingForm}
                {resizeForm}
            </div>
        );
    }

    private onSaveNet = (fileName: string = "mpnet.json") => {

        const data = JSON.stringify(this.state.net, null, 2);
        const blob = new Blob( [ data ], {
            type: 'application/octet-stream'
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);

        const event = document.createEvent('MouseEvents');
        event.initMouseEvent(
            'click', true, true, window, 1, 0, 0, 0, 0,
            false, false, false, false, 0, null);
        link.dispatchEvent(event);
    }

    private onLoadNet = (file: File) => {
        const fr = new FileReader();
        fr.onload = () => {
            const data = fr.result as string;
            const net = JSON.parse(data);
            this.setState(() => ({net: fillDefaultRelatedPositions(net)}));
        };
        /* fr.readAsText(evt.target.files[0]); */
        fr.readAsText(file);
    }

    private onFitNet = () => {
        // TODO: the bounding box of the net
        this.setState(({canvasToolbar}: any) => ({canvasToolbar: {
            // TODO: I can use this to fit selection on net bounding box
            value: fitSelection(canvasToolbar.value, 40, 40, 200, 200),
            tool: canvasToolbar.tool,
        }}));
    }

    private onSelectNetElement = (path: Path | null) => () => {
        if (this.state.canvasToolbar.tool !== TOOL_AUTO) {
            return;
        }

        this.setState(() => ({selected: {path}}));
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

    private onRemoveNetElement = (category: NetCategory) => (id: ID) => {
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

    private onChangeToolbarValue = (toolbar: ToolbarType) => (value: any) => {

        this.setState(({[toolbar]: currentToolbar}: any) => ({[toolbar]: {
            value,
            tool: currentToolbar.tool,
        }}));
    }

    private onChangeToolbarsTool = (
        canvasTool: any,
        netTool: NetTool | null = null
    ) => {
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
