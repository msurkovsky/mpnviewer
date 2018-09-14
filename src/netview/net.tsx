import * as React from 'react';
import {POSITION_NONE, ReactSVGPanZoom} from 'react-svg-pan-zoom';
import * as Utils from '../utils';


import {endAddingArc, startAddingArc} from '../features/addarc';
import {
    emptyPlace, emptyTransition,
    startAddingNetElement
} from '../features/addnetelements';

import {AppEvents} from '../app';
import {
    ArcType, BaseNetElement, NetCategory, NetElementType,
    netElementTypeToCategory, NetNode, NetStructure
} from '../netmodel';
import {
    CanvasToolbarState, NetTool,
    NetToolbarState, Toolbar, ToolbarType
} from '../toolbar';
import {Path, Resizable, Size, Vector2d} from '../types';

import {Arc, ArcPositions} from './arc';


export const CANVAS_ID = "netcanvas";

export interface CanvasCtxData {
    zoom: number;
    pan: Vector2d;
}

type Props = Size & AppEvents & {
    net: NetStructure;
    netToolbarState: NetToolbarState;
    canvasToolbarState: CanvasToolbarState;
}

interface State {
    canvasContext: CanvasCtxData
}

export const CanvasContext = React.createContext({zoom: 1.0, pan: {x: 0, y: 0}});

export class Net extends React.Component<Props, State> {

    public state = {
        canvasContext: {
            zoom: 1.0,
            pan: {x: 0, y: 0}
        }
    };

    public render() {
        const {width, height, canvasToolbarState: cts, netToolbarState: nts,
               onSelectNetElement,
               onFitNet, onSaveNet, onLoadNet,
               onChangeToolbarValue, onChangeToolbarsTool} = this.props;

        return (
            <CanvasContext.Provider value={this.state.canvasContext}>
            <Toolbar
                activeCanvasTool={cts.tool}
                activeNetTool={nts.tool}
                fitNet={onFitNet}
                saveNet={onSaveNet}
                loadNet={onLoadNet}
                addNewPlace={this.createNetNode(emptyPlace)}
                addNewTransition={this.createNetNode(emptyTransition)}
                changeToolbarsTool={onChangeToolbarsTool} />
            <div id={CANVAS_ID} style={{position: "relative", width, height}}>
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
                      {this.renderNetNode(NetElementType.PLACE)}
                      {this.renderNetNode(NetElementType.TRANSITION)}
                    </g>
                </svg>
            </ReactSVGPanZoom>
            </div>
            </CanvasContext.Provider>
        );
    }

    protected renderArcs() {
        const {net,
               onSelectNetElement,
               onRemoveNetElement,
               onChangeNetProperty,
        } = this.props;
        const {canvasContext: {zoom, pan}} = this.state;

        const arcComponents = [];
        for (const key of Object.keys(net.arcs)) {
            const arc = net.arcs[key];
            const points = Utils.getArcPoints(arc, net);
            const {data, relatedPositions} = arc;

            const path = ["arcs", key];

            const removeArc = () => onRemoveNetElement(NetCategory.ARCS)(key);

            arcComponents.push(
                <Arc
                    key={`${Utils.getArcId(arc, net)}`}
                    path={path}
                    data={data}
                    zoom={zoom}
                    pan={pan}
                    anchorPosition={{x: 0, y: 0}}
                    points={points}
                    relatedPositions={relatedPositions as ArcPositions}
                    select={onSelectNetElement(path)}
                    remove={removeArc}
                    changePosition={onChangeNetProperty} />);
        }

        return arcComponents;
    }

    protected renderNetNode(type: NetElementType) {
        const category = netElementTypeToCategory(type);
        const {
            net: {[category]: elements},
            onSelectNetElement,
            onRemoveNetElement,
            onChangeNetProperty,
        } = this.props;
        const {canvasContext: {zoom, pan}} = this.state;

        const Component = Utils.getNetComponet(type);

        const results = [];
        for (const key of Object.keys(elements)) {
            const {data, position, size, relatedPositions} = elements[key];
            const path = [category, key];

            const removeNetElement = () => onRemoveNetElement(category)(key);

            results.push(
                <Component
                    key={data.id}
                    path={path}
                    data={data}
                    zoom={zoom}
                    pan={pan}
                    anchorPosition={{x: 0, y: 0}}
                    position={position}
                    size={size}
                    relatedPositions={relatedPositions}
                    select={onSelectNetElement(path)}
                    remove={removeNetElement}
                    createNewArc={this.createNewArc(
                            {data, type, position, size}, path)}
                    changePosition={onChangeNetProperty} />);
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

    private createNewArc = (startNode: NetNode, path: Path) => () => {
        const {netToolbarState} = this.props;
        if (netToolbarState.tool !== NetTool.ADD_ARC) {
            return false;
        }

        const {onAddNetElement, onRemoveNetElement, onChangeToolbarValue} = this.props;
        const netCategory = netElementTypeToCategory(startNode.type);

        const {canvasContext: {zoom, pan}} = this.state;
        if (netToolbarState.value === null) {
            // no value is set => start creating arc
            startAddingArc(
                CANVAS_ID, zoom, pan,
                startNode, path,
                onAddNetElement(netCategory),
                onRemoveNetElement(netCategory),
                onChangeToolbarValue(ToolbarType.NET)
            );
        } else {
            // value is set => end creating arc
            endAddingArc(path);
        }
        return true;
    }

    private createNetNode = (create: () => BaseNetElement & Resizable) => () => {
        const {onAddNetElement, onRemoveNetElement,
               onChangeNetProperty, onChangeToolbarsTool} = this.props;
        const {canvasContext: {zoom, pan}} = this.state;

        const netNode = create();
        const netCategory = netElementTypeToCategory(netNode.type);
        startAddingNetElement(
            CANVAS_ID, zoom, pan,
            netNode,
            onAddNetElement(netCategory),
            onRemoveNetElement(netCategory),
            onChangeNetProperty,
            onChangeToolbarsTool
        );
    }
}
