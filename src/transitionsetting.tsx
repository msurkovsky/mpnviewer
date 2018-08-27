import * as React from 'react'
import {Button, Form, Input, Label} from 'reactstrap'

import {TransitionData} from './netmodel'

type Props = TransitionData & {
    triggerChangesSubmit: (transData: TransitionData) => void;
};

export class TransitionSetting extends React.Component<Props, any> {

    constructor (props: Props) {
        super(props);

        const {name, guard, code} = this.props;
        this.state = {name, guard: guard || "" , code: code || ""};
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
        };

        const onChangeGuard = (evt: any) => {
            const val = evt.target.value;
            let guardList: string[] = [];
            if (val !== "") { // split on empty string returns empty string,
                              // hence the list is not empty
                guardList = val.split(',');
            }
            this.setState(() => ({ guard: guardList }));
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
