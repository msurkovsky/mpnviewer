import * as React from 'react';
import {TOOL_AUTO, TOOL_NONE} from 'react-svg-pan-zoom'
import {Button, ButtonGroup, ButtonToolbar, Input} from 'reactstrap';

import {emptyPlace, emptyTransition, startAddingNetElement} from './features/addnetelements'
import {UnpositionedNetElement} from './netmodel'

export enum NetTool {
    NONE = "none",
    ADD_PLACE = "adding-place",
    ADD_TRANSITION = "adding-transitin",
    ADD_ARC = "adding-arc",
}

export interface NetToolbarState {
    tool: NetTool,
    value: any
}

interface Props { // TODO: what about the any arguments of events?
    activeTool: any;
    activeNetTool: NetTool,
    triggerFitNet: (evt: any) => void;
    triggerChangeToolbarTools: (canvasTool: any, netTool: NetTool | null) => void;
    triggerAddPlace: (evt: any) => void;
    triggerAddTransition: (evt: any) => void;
    triggerRemovePlace: (evt: any) => void;
    triggerRemoveTransition: (evt: any) => void;
    triggerSaveNet: (evt: any) => void;
    triggerLoadNet: (evt: any) => void;
    triggerPositionChanged: (evt: any) => void;
}

export class Toolbar extends React.Component<Props, any> {

    private viewerInst: {ViewerDOM: any, state: any};

    public setViewer (viewer: {ViewerDOM: any, state: any}) {
        this.viewerInst = viewer;
    }

    public render () {
        const {
            activeTool, activeNetTool,
            triggerChangeToolbarTools,
            triggerAddPlace, triggerAddTransition,
            triggerRemovePlace, triggerRemoveTransition,
            triggerPositionChanged,
            triggerSaveNet,
            triggerLoadNet,
        } = this.props;

        const addNetElement = (
            netTool: NetTool,
            getElement: () => UnpositionedNetElement,
            triggerAddNetElement: (evt: any) => void,
            triggerRemoveNetElement: (id: string) => void
        ) => (evt: React.MouseEvent) => {

            const element = getElement();

            startAddingNetElement(
                this.viewerInst,
                element,
                triggerAddNetElement,
                triggerRemoveNetElement,
                triggerPositionChanged,
                triggerChangeToolbarTools,
            )(evt);
        };

        const toggleAddArc = (evt: React.MouseEvent) => {
            triggerChangeToolbarTools(TOOL_NONE, NetTool.ADD_ARC);
        };

        const autoTool = () => {triggerChangeToolbarTools(TOOL_AUTO, NetTool.NONE)};

        return (
          <ButtonToolbar>
            <Button
                onClick={autoTool}
                active={activeTool === TOOL_AUTO}>
                Select
            </Button>

            <ButtonGroup>
                <Button onClick={addNetElement(NetTool.ADD_PLACE,
                                               emptyPlace,
                                               triggerAddPlace,
                                               triggerRemovePlace)}
                        active={activeNetTool === NetTool.ADD_PLACE}>
                    Place
                </Button>
                <Button onClick={addNetElement(NetTool.ADD_TRANSITION,
                                               emptyTransition,
                                               triggerAddTransition,
                                               triggerRemoveTransition)}
                        active={activeNetTool === NetTool.ADD_TRANSITION}>
                    Transition
                </Button>
                <Button onClick={toggleAddArc}
                        active={activeNetTool === NetTool.ADD_ARC}>
                    Arc
                </Button>
            </ButtonGroup>

            <ButtonGroup>
                <Button onClick={triggerSaveNet}>
                    Save MP net
                </Button>

                <Input id="loadMPNet" type="file" onChange={triggerLoadNet}/>
            </ButtonGroup>
          </ButtonToolbar>
        );
    }
}
