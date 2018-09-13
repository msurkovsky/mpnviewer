import * as React from 'react';
import {Button, Form, FormGroup, Input, Label} from 'reactstrap';
import {Size} from '../types';
import {ResizableSettingFormProps} from './types';


type Props = ResizableSettingFormProps;

export class ResizableSetting extends React.Component<Props, any> {

    constructor (props: Props) {
        super (props);

        this.state = {...this.props.size};
    }

    public render() {
        const {width, height} = this.state;
        const {submitChanges, path} = this.props;

        const submit = () => {
            submitChanges({
                path,
                value: {size: {width, height}},
            });
        };

        const onChangeDimension =
            (dimension: keyof Size) =>
                (evt: React.FormEvent<HTMLInputElement>) => {

            const val = evt.currentTarget.value;
            this.setState(() => ({[dimension]: val}));
        };

        return (
            <Form>
                <FormGroup>
                <Label>
                    Width:
                    <Input
                        value={width}
                        type="text"
                        onChange={onChangeDimension("width")} />
                </Label>

                <Label>
                    Height:
                    <Input
                        value={height}
                        type="text"
                        onChange={onChangeDimension("height")} />
                </Label>
                </FormGroup>

                <Button color="primary" onClick={submit}>Submit</Button>
            </Form>
        )
    }
}
