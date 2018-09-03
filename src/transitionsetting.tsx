import * as React from 'react'
import {Button,
        Form, FormGroup,
        Input, Label} from 'reactstrap'

import {ElementValueChanged} from './events'
import {TransitionData} from './netmodel'
import {Size} from './types'
import {codeRef2String, identity} from './utils'

type Props = TransitionData & Size & {
    path: string[];
    triggerChangesSubmit: (evt: ElementValueChanged) => void;
};

export class TransitionSetting extends React.Component<Props, any> {

    constructor (props: Props) {
        super(props);

        const {name, guard, codeRef, width, height} = this.props;
        this.state = {
            name, width, height,
            guard: guard || "" , codeRef: codeRef || null};
    }

    public render() {
        const {name, width, height, guard, codeRef} = this.state;
        const {triggerChangesSubmit, id, path} = this.props;

        const submit = () => {
            triggerChangesSubmit({
                path,
                value: {
                    data: {id, name, guard, codeRef},
                    size: {width, height}
                },
            });
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
                <FormGroup>
                    <Label>
                        Name:
                        <Input
                            value={name}
                            type="text"
                            onChange={onChange("name")} />
                    </Label>
                </FormGroup>

                <FormGroup>
                    <Label>
                        Guard:
                        <Input
                            value={guard}
                            type="text"
                            onChange={onChangeGuard} />
                    </Label>
                </FormGroup>

                <FormGroup>
                    <Label>
                        Code reference:
                        <Input
                            value={codeRef2String(codeRef)}
                            type="text"
                            onChange={onChange("codeRef", codeRefTransform)} />
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
