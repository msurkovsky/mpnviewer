import * as React from 'react';
import {TOOL_AUTO, TOOL_NONE, TOOL_PAN, TOOL_ZOOM_IN, TOOL_ZOOM_OUT} from 'react-svg-pan-zoom'
import {Button, ButtonGroup, ButtonToolbar} from 'reactstrap';

import {emptyPlace, startAddNetElement} from './features/addnetelements'


interface Props {
    activeTool: any;
    triggerFitNet: (evt: any) => void;
    triggerToolChange: (tool: any) => (evt: any) => void;
    triggerAddPlace: (evt: any) => void;
}

export class Toolbar extends React.Component<Props, any> {

    public render () {
        const {activeTool, triggerToolChange} = this.props;

        const addPlace = (evt: React.MouseEvent) => {
            triggerToolChange(TOOL_NONE)(evt);

            const p = emptyPlace();
            const position = {
                x: evt.clientX + p.size.width / 2,
                y: evt.clientY + p.size.height / 2
            };
            startAddNetElement({...p, position})(evt);
        };

        return (
          <ButtonToolbar>
            <ButtonGroup>
                <Button
                    onClick={triggerToolChange(TOOL_AUTO)}
                    active={activeTool === TOOL_AUTO}
                >
                    Select
                </Button>
                <Button
                    onClick={triggerToolChange(TOOL_PAN)}
                    active={activeTool === TOOL_PAN}
                >
                    Move
                </Button>
                <Button
                    onClick={triggerToolChange(TOOL_ZOOM_IN)}
                    active={activeTool === TOOL_ZOOM_IN}
                >
                    Zoom-in
                </Button>
                <Button
                    onClick={triggerToolChange(TOOL_ZOOM_OUT)}
                    active={activeTool === TOOL_ZOOM_OUT}
                >
                    Zoom-out
                </Button>
            </ButtonGroup>

            <ButtonGroup>
                <Button onClick={addPlace}>
                    Place
                </Button>
                <Button>
                    Transition
                </Button>
                <Button>
                    Arc
                </Button>
            </ButtonGroup>
          </ButtonToolbar>
        );
    }
}
