import * as React from 'react';
import {POSITION_NONE, ReactSVGPanZoom} from 'react-svg-pan-zoom';
import {ArcElement, ArcType, NetCategory} from '../netmodel';
import * as Utils from '../utils';

import {NetToolbarState} from '../toolbar'
import {Vector2d} from '../types'
import {Arc} from './arc'
import {Place} from './place';
import {Transition} from './transition';


interface State {
    canvasContext: CanvasCtxData
    viewerInst: Viewer | null;
}

export interface Viewer {
    ViewerDOM: any;
    state: any;
}

const defaultState = {
    canvasContext: {
        zoom: 1.0,
        pan: {x: 0.0, y: 0.0},
    },
    viewerInst: null,
};

export interface CanvasCtxData {
    zoom: number;
    pan: Vector2d;
}

export const CanvasContext = React.createContext({...defaultState.canvasContext});

export class Net extends React.Component<any, any> {

    public state = {...defaultState};
    public viewerInst: any = null;

    public componentDidMount() {
        this.setState({viewerInst: this.viewerInst});
    }

    public render() {
        const {net, width, height,
               canvasToolbar, netToolbar,
               triggerSelect,
               triggerAddArc, triggerRemoveElement,
               triggerChangeNetToolbarValue,
               triggerChangeValue, triggerChangeToolbarTools} = this.props;

        return (
            <div id="netcanvas" style={{position: "relative", width, height}}>
            <CanvasContext.Provider value={this.state.canvasContext}>
            <ReactSVGPanZoom
                ref={(viewerInst: any) => {this.viewerInst = viewerInst}}
                width={width} height={height}
                background="#ffe"
                SVGBackground="#ffe"
                miniaturePosition={POSITION_NONE}
                toolbarPosition={POSITION_NONE}
                value={canvasToolbar.value} onChangeValue={triggerChangeValue}
                tool={canvasToolbar.tool} onChangeTool={triggerChangeToolbarTools}
                onPan={this.onPan}
                onZoom={this.onZoom}
                onClick={triggerSelect(null)}>

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
                      {this.renderArcs(net.arcs, triggerSelect)}
                        {this.renderPlaces(
                             net.places,
                             netToolbar,
                             triggerSelect,
                             triggerAddArc,
                             triggerRemoveElement,
                             triggerChangeNetToolbarValue
                        )}
                        {this.renderTransitions(
                             net.transitions,
                             netToolbar,
                             triggerSelect,
                             triggerAddArc,
                             triggerRemoveElement,
                             triggerChangeNetToolbarValue
                        )}
                    </g>
                </svg>
            </ReactSVGPanZoom>
            </CanvasContext.Provider>
            </div>
        );
    }

    protected renderArcs(
        arcs: any,
        triggerSelect: (path: string[]) => () => void
    ) {

        const net = this.props.net;

        const triggerPositionChanged = this.props.triggerPositionChanged;

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

    protected renderPlaces (
        places: any,
        netToolbar: NetToolbarState,
        triggerSelect: (path: string[]) => () => void,
        triggerAddArc: (arc: ArcElement) => void,
        triggerRemoveElement: (category: NetCategory) => (id: string) => void,
        triggerChangeNetToolbarValue: (value: any) => void
    ) {
        const triggerPositionChanged = this.props.triggerPositionChanged;

        const results = [];
        for (const key of Object.keys(places)) {
            const {data, position, size, relatedPositions} = places[key];
            const basePath = ["places", key];

            results.push(
                <Place
                    elementType="place"
                    key={data.id}
                    paths={{
                        base: basePath,
                        position: ["position"],
                    }}
                    data={data}
                    parentPosition={{x: 0, y: 0}}
                    {...position}
                    {...size}
                    viewerInst={this.state.viewerInst}
                    triggerSelect={triggerSelect(basePath)}
                    triggerAddArc={triggerAddArc}
                    triggerRemoveElement={triggerRemoveElement}
                    netToolbar={netToolbar}
                    triggerChangeNetToolbarValue={triggerChangeNetToolbarValue}
                    relatedPositions={relatedPositions}
                    triggerPositionChanged={triggerPositionChanged}
                />
            );
        }

        return results;
    }

    protected renderTransitions (
        transitions: any,
        netToolbar: NetToolbarState,
        triggerSelect: (path: string[]) => () => void,
        triggerAddArc: (arc: ArcElement) => void,
        triggerRemoveElement: (category: NetCategory) => (id: string) => void,
        triggerChangeNetToolbarValue: (value: any) => void
    ) {

        const triggerPositionChanged = this.props.triggerPositionChanged;

        const results = [];
        for (const key of Object.keys(transitions)) {
            const {data, position, size, relatedPositions} = transitions[key];
            const basePath = ["transitions", key];

            results.push(
                <Transition
                    elementType="transition"
                    key={data.id}
                    paths={{
                        base: basePath,
                        position: ["position"],
                    }}
                    data={data}
                    parentPosition={{x: 0, y: 0}}
                    {...position}
                    {...size}
                    viewerInst={this.state.viewerInst}
                    triggerSelect={triggerSelect(basePath)}
                    triggerAddArc={triggerAddArc}
                    triggerRemoveElement={triggerRemoveElement}
                    netToolbar={netToolbar}
                    triggerChangeNetToolbarValue={triggerChangeNetToolbarValue}
                    relatedPositions={relatedPositions}
                    triggerPositionChanged={triggerPositionChanged}
                />
            );
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
}
