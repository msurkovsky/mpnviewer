import {pickAll} from 'ramda'
import * as React from 'react'
import {Button,
        Form, FormGroup,
        Input, Label} from 'reactstrap'

import {TransitionData} from '../netmodel'
import {codeRef2String, identity, rejectNulls, undefinedToNulls} from '../utils'
import {NetElementSettingFormProps} from './types';


interface Props extends NetElementSettingFormProps {
    data: TransitionData;
}

export class TransitionSetting extends React.Component<Props, any> {

    constructor (props: Props) {
        super(props);

        this.state = undefinedToNulls(pickAll([
            "name",
            "guard",
            "codeRef"] as Array<keyof TransitionData>, this.props.data));
    }

    public render() {
        const {name, guard, codeRef} = this.state;
        const {submitChanges, data: {id}, path} = this.props;

        const submit = () => {
            submitChanges({
                path,
                value: () => rejectNulls({id, name, guard, codeRef}),
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
                            value={name || ""}
                            type="text"
                            onChange={onChange("name")} />
                    </Label>
                </FormGroup>

                <FormGroup>
                    <Label>
                        Guard:
                        <Input
                            value={guard || ""}
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

                <Button color="primary" onClick={submit}>Submit</Button>
            </Form>
        );
    }
}
