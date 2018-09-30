import * as React from 'react';
import {TOOL_AUTO, TOOL_NONE} from 'react-svg-pan-zoom';
import {Button, ButtonGroup, ButtonToolbar, Input} from 'reactstrap';

import Download from '@axetroy/react-download';

import {NetStructure} from './netmodel';

export enum NetTool {
    NONE = "none",
    ADD_PLACE = "adding-place",
    ADD_TRANSITION = "adding-transitin",
    ADD_ARC = "adding-arc",
}

export interface NetToolbarState {
    tool: NetTool;
    value: any;
}

export interface CanvasToolbarState {
    tool: any;
    value: any;
}

export enum ToolbarType {
    CANVAS = "canvasToolbar",
    NET = "netToolbar",
}

interface Props { // TODO: what about the any arguments of events?
    currentNet: NetStructure;
    activeCanvasTool: any;
    activeNetTool: NetTool,
    changeToolbarsTool: (canvasTool: any, netTool: NetTool | null) => void;
    serializeNetSVG: () => string;
    addNewPlace: () => void;
    addNewTransition: () => void;
    loadNet: (data: string) => void;
}

export class Toolbar extends React.Component<Props, any> {

    public render () {
        const {
            currentNet,
            activeCanvasTool, activeNetTool,
            changeToolbarsTool,
            addNewPlace, addNewTransition,
            loadNet, serializeNetSVG,
        } = this.props;

        const setAddArcTool = () => {changeToolbarsTool(TOOL_NONE, NetTool.ADD_ARC)};
        const setAutoTool = () => {changeToolbarsTool(TOOL_AUTO, NetTool.NONE)};
        const onLoadNet = (evt: React.FormEvent<HTMLInputElement>) => {
            const fr = new FileReader();
            fr.onload = () => {loadNet(fr.result as string)};
            const files = evt.currentTarget.files;
            if (files && files.length > 0) {
                fr.readAsText(files[0]);
            }
        };

        return (
          <ButtonToolbar>
            <Button
                onClick={setAutoTool}
                active={activeCanvasTool === TOOL_AUTO}>
                Select
            </Button>

            <ButtonGroup>
                <Button onClick={addNewPlace}
                        active={activeNetTool === NetTool.ADD_PLACE}>
                    Place
                </Button>
                <Button onClick={addNewTransition}
                        active={activeNetTool === NetTool.ADD_TRANSITION}>
                    Transition
                </Button>
                <Button onClick={setAddArcTool}
                        active={activeNetTool === NetTool.ADD_ARC}>
                    Arc
                </Button>
            </ButtonGroup>

            <ButtonGroup>
                <Download file="mpnet.svg" content={serializeNetSVG()}>
                    <Button>Export MP Net</Button>
                </Download>
                <Download file="mpnet.json" content={JSON.stringify(currentNet, null, 2)}>
                    <Button>Save MP Net</Button>
                </Download>

                <Input id="loadMPNet" type="file" onChange={onLoadNet}/>
            </ButtonGroup>
          </ButtonToolbar>
        );
    }
}
