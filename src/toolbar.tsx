import * as React from 'react';
import {TOOL_AUTO, TOOL_NONE} from 'react-svg-pan-zoom';
import {Button, ButtonGroup, ButtonToolbar, Input} from 'reactstrap';

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
    activeTool: any;
    activeNetTool: NetTool,
    changeToolbarTools: (canvasTool: any, netTool: NetTool | null) => void;
    // TODO: get rid of any
    fitNet: (evt: any) => void;
    addPlace: (evt: any) => void;
    addTransition: (evt: any) => void;
    saveNet: (evt: any) => void;
    loadNet: (evt: any) => void;
}

export class Toolbar extends React.Component<Props, any> {

    public render () {
        const {
            activeTool, activeNetTool,
            changeToolbarTools,
            addPlace, addTransition,
            saveNet, loadNet,
        } = this.props;

        const setAddArcTool = () => {changeToolbarTools(TOOL_NONE, NetTool.ADD_ARC)};
        const setAutoTool = () => {changeToolbarTools(TOOL_AUTO, NetTool.NONE)};

        return (
          <ButtonToolbar>
            <Button
                onClick={setAutoTool}
                active={activeTool === TOOL_AUTO}>
                Select
            </Button>

            <ButtonGroup>
                <Button onClick={addPlace}
                        active={activeNetTool === NetTool.ADD_PLACE}>
                    Place
                </Button>
                <Button onClick={addTransition}
                        active={activeNetTool === NetTool.ADD_TRANSITION}>
                    Transition
                </Button>
                <Button onClick={setAddArcTool}
                        active={activeNetTool === NetTool.ADD_ARC}>
                    Arc
                </Button>
            </ButtonGroup>

            <ButtonGroup>
                <Button onClick={saveNet}>
                    Save MP net
                </Button>

                <Input id="loadMPNet" type="file" onChange={loadNet}/>
            </ButtonGroup>
          </ButtonToolbar>
        );
    }
}
