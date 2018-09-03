import * as React from 'react'
import {Button, Form, Input, Label} from 'reactstrap'

import {TransitionData} from './netmodel'
import {codeRef2String, identity} from './utils'

type Props = TransitionData & {
    triggerChangesSubmit: (transData: TransitionData) => void;
};

export class TransitionSetting extends React.Component<Props, any> {

    constructor (props: Props) {
        super(props);

        const {name, guard, codeRef} = this.props;
        this.state = {name, guard: guard || "" , codeRef: codeRef || null};
    }

    public render() {
        const {name, guard, codeRef} = this.state;
        const {triggerChangesSubmit, id} = this.props;

        const submit = () => {
            triggerChangesSubmit({id, name, guard, codeRef});
        };

        const onChange = (key: string,
                          transform: (v: string) => any = identity) => (evt: any) => {
            const val = transform(evt.target.value);
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

        const codeRefTransform = (v: string): number | [number, number] => {
            const r = v.split('-');
            if (r.length === 1) {
                return +r[0];
            } else if (r.length === 2) {
                return [+r[0], +r[1]];
            } else {
                throw new Error("Invalid format of code reference");
            }
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

                <Label for="trans-codeRef">Code reference</Label>
                <Input
                    id="trans-codeRef"
                    value={codeRef2String(codeRef)}
                    type="text"
                    onChange={onChange("codeRef", codeRefTransform)} />

                <Button onClick={submit}>Submit</Button>
            </Form>
        );
    }
}
