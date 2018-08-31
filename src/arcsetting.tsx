import * as React from 'react'
import {Button, ButtonGroup, ButtonToolbar, Form, Input, Label} from 'reactstrap'

import {ArcData, ArcType} from './netmodel'

type Props = ArcData & {
    triggerChangesSubmit: (arcData: ArcData) => void;
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
        const {triggerChangesSubmit, id} = this.props;

        const submit = () => {
            triggerChangesSubmit({id, expression, type});
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
                <Label for="arc-expr">Name</Label>
                <Input
                    id="arc-expr"
                    value={expression}
                    type="text"
                    onChange={onChangeExpr} />

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

                <Button color="primary" onClick={submit}>Submit</Button>
            </Form>
        );
    }
}
