import * as React from 'react'
import {Button, Form, Input, Label} from 'reactstrap'

import {TransitionData} from './netmodel'

type Props = TransitionData & {
    triggerChangesSubmit: (placeData: TransitionData) => void;
};

export class TransitionSetting extends React.Component<Props, any> {

    constructor (props: Props) {
        super(props);

        const {name, guard, code} = this.props;
        this.state = {name, guard, code};
    }

    public render() {
        const {name, guard, code} = this.state;
        const {triggerChangesSubmit, id} = this.props;

        const submit = () => {
            triggerChangesSubmit({id, name, guard, code});
        };

        const onChange = (key: string) => (evt: any) => {
            const val = evt.target.value;
            this.setState(() => ({[key]: val}));
            evt.preventDefault();
        };

        const onChangeGuard = (evt: any) => {
            const val = evt.target.value;
            const guardList = val.split(',');
            this.setState(() => ({
                guard: guardList
            }));
        }

        return (
            <Form>
                <Label for="trans-name">Name</Label>
                <Input
                    id="trans-name"
                    value={name}
                    type="text"
                    onChange={onChange("name")} />

                <Label for="trans-guard">Guard</Label>
                <Input
                    id="trans-guard"
                    value={guard}
                    type="text"
                    onChange={onChangeGuard} />

                <Label for="trans-code">Code reference</Label>
                <Input
                    id="trans-code"
                    value={code}
                    type="text"
                    onChange={onChange("code")} />

                <Button onClick={submit}>Submit</Button>
            </Form>
        );
    }
}
