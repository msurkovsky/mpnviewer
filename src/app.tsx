import * as Ramda from 'ramda';
import * as React from 'react';
import {TOOL_AUTO} from 'react-svg-pan-zoom';

import {NetElementSettingForm} from './components/types';

import {isArc, isPlace, isTransition,
        NetCategory, NetElement, NetStructure} from './netmodel';
import {Net} from './netview';

import {NetPropertyChanged} from './events';

import {ArcSetting, PlaceSetting,
        ResizableSetting, TransitionSetting} from './components';

import {NetTool, ToolbarType} from './toolbar';
import {ID, Path, Resizable} from './types';
import {fillDefaultRelatedPositions,
        fillElementDefaultRelatedPosition} from './utils';

export const CANVAS_ID = "netcanvas";

export interface AppEvents {
    loadNet: (data: string) => void;
    serializeNetSVG: () => string;
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
    } as NetStructure,
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
                    canvasId={CANVAS_ID}
                    width={1600} height={700}
                    net={net}
                    canvasToolbarState={canvasToolbar}
                    netToolbarState={netToolbar}
                    loadNet={this.loadNet}
                    serializeNetSVG={this.serializeNetSVG}
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

    private loadNet = (data: string) => {
        const net = JSON.parse(data);
        this.setState(() => ({net: fillDefaultRelatedPositions(net)}));
    }

    private serializeNetSVG = () => {

        const canvas = document.getElementById(CANVAS_ID);
        const defs = document.getElementById(`${CANVAS_ID}-defs`);
        const elements = document.getElementById(`${CANVAS_ID}-netelements`);
        if (canvas && defs && elements) {
            const cvsBbox = canvas.getBoundingClientRect();
            const {top: cvsY, left: cvsX} = cvsBbox;

            const serializer = new XMLSerializer();
            const defsStr = serializer.serializeToString(defs);
            const elementsStr = serializer.serializeToString(elements);

            const bbox = elements.getBoundingClientRect();
            let {top: y, left: x} = bbox;
            x -= cvsX;
            y -= cvsY;

            const {width, height} = bbox;

            const canvasValue = this.state.canvasToolbar.value;
            if (canvasValue) {
                const {e: panX, f: panY} = canvasValue as {e: number, f: number};
                x -= panX;
                y -= panY;
            }
            return `<?xml version="1.0" standalone="no"?>
                    <svg viewBox="${x} ${y} ${width} ${height}"
                         xmlns="http://www.w3.org/2000/svg"
                         width="${width}"
                         heigh="${height}">
                      ${defsStr}
                      ${elementsStr}
                    </svg>`;
        }

        return "";
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
                () => evt.value(),
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
