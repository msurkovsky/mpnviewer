import * as React from 'react';
import {POSITION_NONE, ReactSVGPanZoom} from 'react-svg-pan-zoom';
import {ArcElement, ArcType, NetElement, NetElementType, netElementTypeToCategory,
        NetNodeType, NetStructure, PlaceElement, TransitionElement
} from '../netmodel';
import * as Utils from '../utils';

import {endAddingArc, startAddingArc} from '../features/addarc';

import {AppEvents} from '../app';
import {CanvasToolbarState,
        NetTool, NetToolbarState, ToolbarType} from '../toolbar';
import {Dict, Path, Size, Vector2d} from '../types';
import {Arc} from './arc';
import {Place} from './place';
import {Transition} from './transition';


const {ARC, PLACE, TRANSITION} = NetElementType;

export interface CanvasCtxData {
    zoom: number;
    pan: Vector2d;
}

type Props = Size & AppEvents & {
    net: NetModel;
    netToolbarState: NetToolbarState;
    canvasToolbarState: CanvasToolbarState;
}

interface State {
    canvasContext: CanvasCtxData
}

export const CanvasContext = React.createContext({zoom: 0.0, pan: {x: 0, y: 0}});

export class Net extends React.Component<Props, State> {

    public state = {
        canvasContext: {
            zoom: 0.0,
            pan: {x: 0, y: 0}
        }
    };

    public render() {
        const {width, height, canvasToolbarState: cts, onSelectNetElement,
               onChangeToolbarValue, onChangeToolbarsTool} = this.props;

        return (
            <div id="netcanvas" style={{position: "relative", width, height}}>
            <CanvasContext.Provider value={this.state.canvasContext}>
            <ReactSVGPanZoom
                width={width} height={height}
                background="#ffe"
                SVGBackground="#ffe"
                miniaturePosition={POSITION_NONE}
                toolbarPosition={POSITION_NONE}
                value={cts.value} onChangeValue={onChangeToolbarValue(ToolbarType.CANVAS)}
                tool={cts.tool} onChangeTool={onChangeToolbarsTool}
                onPan={this.onPan}
                onZoom={this.onZoom}
                onClick={onSelectNetElement(null)}>

                <svg width={width} height={height}>
                    <defs>
                        <marker id={ArcType.SINGLE_HEADED} viewBox="0 0 10 10" refX="8" refY="5"
                                markerWidth="10" markerHeight="8"
                                orient="auto-start-reverse">
                            <path d="M 0 0 L 10 5 L 0 10 Z" />
                        </marker>

                        <marker id={ArcType.DOUBLE_HEADED} viewBox="0 0 20 10" refX="18" refY="5"
                                markerWidth="18" markerHeight="8"
                                orient="auto-start-reverse">
                            <path d="M 0 0 L 10 5 L 0 10 Z" />
                            <path d="M 10 0 L 20 5 L 10 10 Z" />
                        </marker>

                        <marker id={ArcType.SINGLE_HEADED_RO} viewBox="0 0 10 10" refX="8" refY="5"
                                markerWidth="10" markerHeight="8"
                                orient="auto-start-reverse">
                            <path d="M 0 0 L 10 5 L 0 10 Z" fill="#fff" stroke="#000" strokeWidth="1.5"/>
                        </marker>

                        <marker id={ArcType.DOUBLE_HEADED_RO} viewBox="0 0 20 10" refX="18" refY="5"
                                markerWidth="18" markerHeight="8"
                                orient="auto-start-reverse">
                            <path d="M 0 0 L 10 5 L 0 10 Z" fill="#fff" stroke="#000" strokeWidth="1.5"/>
                            <path d="M 10 0 L 20 5 L 10 10 Z" fill="#fff" stroke="#000" strokeWidth="1.5" />
                        </marker>
                    </defs>

                    <g id="mpnet">
                      {this.renderArcs()}
                      {this.renderNetNode(PLACE)}
                      {this.renderNetNode(TRANSITION)}
                    </g>
                </svg>
            </ReactSVGPanZoom>
            </CanvasContext.Provider>
            </div>
        );
    }

    protected renderArcs() {

        const net = this.props.net;

        const arcComponents = [];
        for (const key of Object.keys(arcs)) {
            const arc = arcs[key];
            const points = Utils.getArcPoints(arc, net);

            const basePath = ["arcs", key];
            arcComponents.push(
                <Arc
                    elementType="arc"
                    key={`${Utils.getArcId(arc, net)}`}
                    paths={{base: basePath}}
                    points={points}
                    triggerSelect={triggerSelect(basePath)}
                    triggerPositionChanged={triggerPositionChanged}
                    relatedPositions={{...arc.relatedPositions}}
                    {...arc.data}
                />
            );
        }

        return arcComponents;
    }

    protected renderNetNode(type: NetElementType) {
        const category = netElementTypeToCategory(type);
        const {
            net: {[category]: elements},
            onSelectNetElement,
            onRemoveNetElement,
        } = this.props;

        const Component = Utils.getNetComponet(type);

        const results = [];
        for (const key of Object.keys(elements)) {
            const {data, position, size, relatedPositions} = elements[key];
            const path = [category, key];

            const selectPlace = () => onSelectNetElement(path);
            const removePlace = () => onRemoveNetElement(category)(key);

            results.push(<Component
                             key={data.id}
                             path={path}
                             data={data}
                             anchorPosition={{x: 0, y: 0}}
                             postion={position}
                             size={size}
                             relatedPositions={relatedPositions}
                             select={selectPlace}
                             remove={removePlace}
                             createNewArc={this.createNewArc(
                                     {data, type, position, size}, path)} />);
        }

        return results;
    }

    protected onZoom = (evt: any) => {
        // `a` keeps the current zoom value
         this.setState(({canvasContext: oldCC}: State) => ({canvasContext: {
            pan: {x: evt.e, y: evt.f}, // zoom changes the pan too
                                       // (zoom to the mouse pointer)
            zoom: evt.a,
        }}));
    }

    protected onPan = (evt: any) => {
        // e->x and f->y are the pan coordinates
        this.setState(({canvasContext: oldCC}: State) => ({canvasContext: {
            ...oldCC,
            pan: {x: evt.e, y: evt.f}
        }}));
    }

    private createNewArc = (startElement: NetNodeType, path: Path) => () => {
        const {netToolbarState} = this.props;
        if (netToolbarState.tool !== NetTool.ADD_ARC) {
            return;
        }
        const {onAddNetElement, onRemoveNetElement, onChangeToolbarValue} = this.props;
        const netCategory = netElementTypeToCategory(startElement.type);

        const {canvasContext: {zoom, pan}} = this.state;
        if (netToolbarState.value === null) {
            // no value is set => start creating arc
            startAddingArc(
                "netcanvas", zoom, pan,
                startElement, path,
                onAddNetElement(netCategory),
                onRemoveNetElement(netCategory),
                onChangeToolbarValue(ToolbarType.NET)
            );
        } else {
            // value is set => end creating arc
            endAddingArc(path);
        }
    }
}
