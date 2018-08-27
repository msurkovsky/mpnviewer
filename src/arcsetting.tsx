import * as React from 'react'
import {Button, Form, Input, Label} from 'reactstrap'

import {ArcData} from './netmodel'

type Props = ArcData & {
    triggerChangesSubmit: (arcData: ArcData) => void;
};

export class ArcSetting extends React.Component<Props, any> {

    constructor (props: Props) {
        super(props);

        const {expression, type} = this.props;
        this.state = {expression, type};
    }

    public render() {
        const {expression, type} = this.state;
        const {triggerChangesSubmit, id} = this.props;

        const submit = () => {
            triggerChangesSubmit({id, expression, type});
        };

        const onChange = (key: string) => (evt: any) => {
            const val = evt.target.value;
            this.setState(() => ({[key]: val}));
            evt.preventDefault();
        };

        return (
            <Form>
                <Label for="arc-expr">Name</Label>
                <Input
                    id="arc-expr"
                    value={expression}
                    type="text"
                    onChange={onChange("expression")} />

                <Button onClick={submit}>Submit</Button>
            </Form>
        );
    }
}
