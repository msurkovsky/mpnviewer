import * as React from 'react'
import {Button, ButtonGroup,
        Form, FormGroup,
        Input, Label} from 'reactstrap'

import {ElementValueChanged} from './events'
import {PlaceData, PlaceDataLayout} from './netmodel'
import {Size} from './types'
import {identity, rejectNulls} from './utils';

type Props = PlaceData & Size & {
    path: string[];
    triggerChangesSubmit: (evt: ElementValueChanged) => void;
};

export class PlaceSetting extends React.Component<Props, any> {

    constructor (props: Props) {
        super(props);

        const {name, type, initExpr, dataLayout, cpLabel,
               width, height} = this.props;
        this.state = {name, type, initExpr, dataLayout, cpLabel: cpLabel || null,
                      width, height};
    }

    public render() {
        const {name, type, initExpr, dataLayout, cpLabel,
               width, height} = this.state;
        const {triggerChangesSubmit, id, path} = this.props;

        const submit = () => {
            triggerChangesSubmit({
                path,
                value: {
                    data: rejectNulls({
                        id, name, type, initExpr, dataLayout, cpLabel
                    }),
                    size: {width, height}
                },
            });
        };


        const onChange = (key: string,
                          transform: (v: string) => any = identity) => (evt: any) => {
            const val = transform(evt.target.value);
            this.setState(() => ({[key]: val}));
        };

        const changeDataLayout = (value: PlaceDataLayout) => () => {
            this.setState(() => ({dataLayout: value}));
        };

        return (
            <Form>
                <FormGroup>
                    <Label>
                       Name
                        <Input
                            value={name}
                            type="text"
                            onChange={onChange("name")} />
                    </Label>
                </FormGroup>

                <FormGroup>
                    <Label>
                        Type:
                        <Input
                            value={type}
                            type="text"
                            onChange={onChange("type")} />
                    </Label>
                </FormGroup>

                <FormGroup>
                    <Label>
                        Initial Expression:
                        <Input
                            value={initExpr}
                            type="text"
                            onChange={onChange("initExpr")} />
                    </Label>
                </FormGroup>

                <FormGroup>
                    <Label>
                        Data layout:
                        <ButtonGroup>
                            <Button
                                onClick={changeDataLayout(PlaceDataLayout.QUEUE)}
                                active={this.state.dataLayout === PlaceDataLayout.QUEUE}>
                                Queue
                            </Button>
                            <Button
                                onClick={changeDataLayout(PlaceDataLayout.MULTISET)}
                                active={this.state.dataLayout === PlaceDataLayout.MULTISET}>
                                Multiset
                            </Button>
                        </ButtonGroup>
                    </Label>
                </FormGroup>

                <FormGroup>
                    <Label>
                        Compount place label:
                        <Input
                            value={cpLabel}
                            type="text"
                            onChange={onChange("cpLabel")} />
                    </Label>
                </FormGroup>

                <FormGroup inline={true}>
                    <Label>
                        Width:
                        <Input
                            value={width}
                            type="text"
                            onChange={onChange("width", parseInt)} />
                    </Label>

                    <Label>
                        Height:
                        <Input
                            value={height}
                            type="text"
                            onChange={onChange("height", parseInt)} />
                    </Label>
                </FormGroup>

                <Button color="primary" onClick={submit}>Submit</Button>
            </Form>
        );
    }
}
