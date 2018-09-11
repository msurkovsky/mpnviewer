import {pickAll} from 'ramda';
import * as React from 'react';
import {Button, ButtonGroup,
        Form, FormGroup,
        Input, Label} from 'reactstrap';

import {PlaceData, PlaceDataLayout} from '../netmodel';
import {identity, rejectNulls, undefinedToNulls} from '../utils';
import {NetElementSettingFormProps} from './types';

interface Props extends NetElementSettingFormProps {
    data: PlaceData;
}

export class PlaceSetting extends React.Component<Props, any> {

    constructor (props: Props) {
        super(props);

        this.state = undefinedToNulls(pickAll([
            "name",
            "dataType",
            "initExpr",
            "dataLayout",
            "cpLabel"], this.props.data));
    }

    public render() {
        const {name, dataType, initExpr, dataLayout, cpLabel} = this.state;
        const {triggerChangesSubmit, data: {id}, path} = this.props;

        const submit = () => {
            triggerChangesSubmit({
                path,
                value: rejectNulls({
                    id, name, dataType, initExpr, dataLayout, cpLabel
                }),
            });
        };

        const onChange = (key: string,
                          transform: (v: string) => any = identity) => (evt: any) => {
            const fieldStr = evt.target.value;
            let val: any = null;
            if (fieldStr !== "") {
                val = transform(fieldStr);
            }
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
                            value={name || ""}
                            type="text"
                            onChange={onChange("name")} />
                    </Label>
                </FormGroup>

                <FormGroup>
                    <Label>
                        Data type:
                        <Input
                            value={dataType || ""}
                            type="text"
                            onChange={onChange("dataType")} />
                    </Label>
                </FormGroup>

                <FormGroup>
                    <Label>
                        Initial Expression:
                        <Input
                            value={initExpr || ""}
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
                            value={cpLabel || ""}
                            type="text"
                            onChange={onChange("cpLabel")} />
                    </Label>
                </FormGroup>

                <Button color="primary" onClick={submit}>Submit</Button>
            </Form>
        );
    }
}
