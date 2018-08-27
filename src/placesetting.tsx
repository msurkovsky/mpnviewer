import * as React from 'react'
import {Button, ButtonGroup, Form, Input, Label} from 'reactstrap'

import {PlaceData, PlaceDataLayout} from './netmodel'

type Props = PlaceData & {
    triggerChangesSubmit: (placeData: PlaceData) => void;
};

export class PlaceSetting extends React.Component<Props, any> {

    constructor (props: Props) {
        super(props);

        const {name, type, initExpr, dataLayout} = this.props;
        this.state = {name, type, initExpr, dataLayout};
    }

    public render() {
        const {name, type, initExpr, dataLayout} = this.state;
        const {triggerChangesSubmit, id} = this.props;

        const submit = () => {
            triggerChangesSubmit({id, name, type, initExpr, dataLayout});
        };

        const onChange = (key: string) => (evt: any) => {
            const val = evt.target.value;
            this.setState(() => ({[key]: val}));
        };

        const changeDataLayout = (value: PlaceDataLayout) => () => {
            this.setState(() => ({dataLayout: value}));
        };

        return (
            <Form>
                <Label for="elem-name">Name</Label>
                <Input
                    id="elem-name"
                    value={name}
                    type="text"
                    onChange={onChange("name")} />

                <Label for="elem-type">Type</Label>
                <Input
                    id="elem-type"
                    value={type}
                    type="text"
                    onChange={onChange("type")} />

                <Label for="elem-initexpr">Initial expression</Label>
                <Input
                    id="elem-initexpr"
                    value={initExpr}
                    type="text"
                    onChange={onChange("initExpr")} />

                <ButtonGroup>
                    <Button
                        onClick={changeDataLayout(PlaceDataLayout.QUEUE)}
                        active={this.state.dataLayout === PlaceDataLayout.QUEUE}
                    >
                        Queue
                    </Button>
                    <Button
                        onClick={changeDataLayout(PlaceDataLayout.MULTISET)}
                        active={this.state.dataLayout === PlaceDataLayout.MULTISET}
                    >
                        Multiset
                    </Button>
                </ButtonGroup>
                <Button onClick={submit}>Submit</Button>
            </Form>
        );
    }
}
