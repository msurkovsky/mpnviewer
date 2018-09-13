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
    activeCanvasTool: any;
    activeNetTool: NetTool,
    changeToolbarsTool: (canvasTool: any, netTool: NetTool | null) => void;
    // TODO: get rid of any
    fitNet: (evt: any) => void;
    addNewPlace: () => void;
    addNewTransition: () => void;
    saveNet: (evt: any) => void;
    loadNet: (evt: any) => void;
}

export class Toolbar extends React.Component<Props, any> {

    public render () {
        const {
            activeCanvasTool, activeNetTool,
            changeToolbarsTool,
            addNewPlace, addNewTransition,
            saveNet, loadNet,
        } = this.props;

        const setAddArcTool = () => {changeToolbarsTool(TOOL_NONE, NetTool.ADD_ARC)};
        const setAutoTool = () => {changeToolbarsTool(TOOL_AUTO, NetTool.NONE)};

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
                <Button onClick={saveNet}>
                    Save MP net
                </Button>

                <Input id="loadMPNet" type="file" onChange={loadNet}/>
            </ButtonGroup>
          </ButtonToolbar>
        );
    }
}
