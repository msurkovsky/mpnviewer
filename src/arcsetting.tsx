import * as React from 'react'
import {Button, ButtonGroup, ButtonToolbar,
        Form, FormGroup,
        Input, Label} from 'reactstrap'

import {ElementValueChanged} from './events'
import {ArcData, ArcType} from './netmodel'

type Props = ArcData & {
    path: string[];
    triggerChangesSubmit: (evt: ElementValueChanged) => void;
};

const {SINGLE_HEADED, DOUBLE_HEADED,
       SINGLE_HEADED_RO, DOUBLE_HEADED_RO} = ArcType;

export class ArcSetting extends React.Component<Props, any> {

    constructor (props: Props) {
        super(props);

        const {expression, type} = this.props;
        this.state = {expression, type};
    }

    public render() {
        const {expression, type} = this.state;
        const {triggerChangesSubmit, id, path} = this.props;

        const submit = () => {
            triggerChangesSubmit({
                path,
                value: {
                    data: {id, name, type, expression},
                },
            });
        };

        const onChangeExpr = (evt: any) => {
            const val = evt.target.value;
            this.setState(() => ({expression: val}));
        };

        const onClick = (arcType: ArcType) => (evt: React.MouseEvent) => {
            this.setState(() => ({type: arcType}));
        };

        return (
            <Form>
                <FormGroup>
                    <Label>
                        Expression:
                        <Input
                            value={expression}
                            type="text"
                            onChange={onChangeExpr} />
                    </Label>
                </FormGroup>

                <FormGroup inline={true}>
                    <Label>
                        Type:
                        <ButtonToolbar>
                        <ButtonGroup>
                            <Button
                                onClick={onClick(SINGLE_HEADED)}
                                active={type === SINGLE_HEADED}>
                                Take
                            </Button>
                            <Button
                                onClick={onClick(DOUBLE_HEADED)}
                                active={type === DOUBLE_HEADED }>
                                Force-take
                            </Button>
                            <Button
                                onClick={onClick(SINGLE_HEADED_RO)}
                                active={type === SINGLE_HEADED_RO}>
                                Read-only
                            </Button>
                            <Button
                                onClick={onClick(DOUBLE_HEADED_RO)}
                                active={type === DOUBLE_HEADED_RO}>
                                Force-read-only
                            </Button>
                        </ButtonGroup>
                        </ButtonToolbar>
                    </Label>
                </FormGroup>

                <Button color="primary" onClick={submit}>Submit</Button>
            </Form>
        );
    }
}
