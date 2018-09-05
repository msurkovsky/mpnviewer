import * as React from 'react'
import {Button, ButtonGroup,
        Form, FormGroup,
        Input, Label} from 'reactstrap'

import {ElementValueChanged} from './events'
import {PlaceData, PlaceDataLayout, PlaceElement} from './netmodel'
import {Position, Positionable, RelativePosition, Size} from './types'
import {identity, rejectNulls} from './utils';
import {font} from './visualsetting'

type Props = PlaceData & (Position | RelativePosition) & Size & {
    path: string[];
    triggerChangesSubmit: (evt: ElementValueChanged) => void;
    triggerAddPlace: (place: PlaceElement) => void;
    triggerRemovePlace: (id: string) => void;
    triggerGetPlace: (id: string) => PlaceElement;
};

export class PlaceSetting extends React.Component<Props, any> {

    constructor (props: Props) {
        super(props);

        const {name, type, initExpr, dataLayout, cpLabel, porView,
               width, height} = this.props;

        this.state = {
            dataLayout, width, height,
            name: name || null,
            type: type || null,
            initExpr: initExpr || null,
            cpLabel: cpLabel || null,
            porView: porView || null,
        };
    }

    public render() {
        const {name, type, initExpr, dataLayout, cpLabel, porView,
               width, height} = this.state;
        const {triggerChangesSubmit, x, y,
               triggerAddPlace, triggerRemovePlace, triggerGetPlace, id, path} = this.props;


        const submit = () => {
          triggerChangesSubmit({
              path,
              value: {
                  data: rejectNulls({
                      id, name, type, initExpr, dataLayout, cpLabel
                  }),
                  size: {width, height},
              },
          });

          if (porView) {
              const porWidth = .7 * width;
              const porHeight = 2 * font.code.size.small;

              const PORRelPos = class extends RelativePosition {
                  constructor (anchorElement: Positionable) {
                      super(anchorElement);
                  }

                  public fetch() {
                      const {
                          data: {id: fId},
                          position: {x: fX, y: fY},
                          size: {width: fW, height: fH},
                      } = triggerGetPlace(this.anchorElement.id);

                      return {id: fId, x: fX, y: fY, width: fW, height: fH};
                  }

                  public getX () {

                      const {x: anchorX, width: anchorWidth} = this.fetch();

                      return anchorX + (anchorWidth - porWidth) / 2;
                  }

                  public getY() {
                      const {y: anchorY} = this.fetch();
                      return anchorY - porHeight / 2;
                  }
              }

              const relPos = new PORRelPos({id, x, y, width, height});
              triggerAddPlace({
                  data: {
                      id: `${id}-porView`,
                      name: porView,
                      dataLayout: PlaceDataLayout.MULTISET,
                  },
                  position: relPos,
                  size: {width: porWidth, height: porHeight},
              });
          } else {
              triggerRemovePlace(`${id}-porView`);
          }
        };


        const onChange = (key: string,
                          transform: (v: string) => any = identity) => (evt: any) => {
            const fieldStr = evt.target.value;
            let val: any = null;
            if (fieldStr !== "") {
                val = transform(fieldStr);
            }
            this.setState(() => ({[key]: val}));
        };

        const changeDataLayout = (value: PlaceDataLayout) => () => {
            this.setState(() => ({dataLayout: value}));
        };

        return (
            <Form>
                <FormGroup>
                    <Label>
                       Name
                        <Input
                            value={name || ""}
                            type="text"
                            onChange={onChange("name")} />
                    </Label>
                </FormGroup>

                <FormGroup>
                    <Label>
                        Type:
                        <Input
                            value={type || ""}
                            type="text"
                            onChange={onChange("type")} />
                    </Label>
                </FormGroup>

                <FormGroup>
                    <Label>
                        Initial Expression:
                        <Input
                            value={initExpr || ""}
                            type="text"
                            onChange={onChange("initExpr")} />
                    </Label>
                </FormGroup>

                <FormGroup>
                    <Label>
                        Data layout:
                        <ButtonGroup>
                            <Button
                                onClick={changeDataLayout(PlaceDataLayout.QUEUE)}
                                active={this.state.dataLayout === PlaceDataLayout.QUEUE}>
                                Queue
                            </Button>
                            <Button
                                onClick={changeDataLayout(PlaceDataLayout.MULTISET)}
                                active={this.state.dataLayout === PlaceDataLayout.MULTISET}>
                                Multiset
                            </Button>
                        </ButtonGroup>
                    </Label>
                </FormGroup>

                <FormGroup>
                    <Label>
                        Compount place label:
                        <Input
                            value={cpLabel || ""}
                            type="text"
                            onChange={onChange("cpLabel")} />
                    </Label>
                </FormGroup>

                <FormGroup>
                    <Label>
                        Partial order view:
                        <Input
                            value={porView || ""}
                            type="text"
                            onChange={onChange("porView")} />
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
