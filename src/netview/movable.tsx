import * as React from 'react';
import * as Utils from '../utils';

import {PositionChanged} from '../events';
import {ArcElement, NetCategory} from '../netmodel';
import {NetToolbarState} from '../toolbar';
import {Dict, Position, Size} from '../types';
import {FontSetting, FontSize} from '../visualsetting';

import {startMoving, stopMoving} from '../features/move';
import {CanvasContext, CanvasCtxData, Viewer} from './net';

// Moveable HOC ================================================================

export interface MouseTriggers {
    triggerMouseDown?: (e: React.MouseEvent) => void;
    triggerMouseUp?: (e: React.MouseEvent) => void;
}


export interface PositionTriggers {
    triggerPositionChanged?: (e: PositionChanged) => void;
}


type BaseComponentProps = Position & Partial<Size> & MouseTriggers & PositionTriggers & {
    paths?: {
        base: string[];
        position: string[];
    };
    triggerSelect?: () => void;
    relatedPositions?: Dict<Position>;
    viewerInst?: Viewer;
    netToolbar?: NetToolbarState;
    triggerChangeNetToolbarValue?: (value: any) => void;
    triggerAddArc?: (arc: ArcElement) => void;
    triggerRemoveElement?: (category: NetCategory) => (id: string) => void;
    font?: FontSetting;
    fontSize?: FontSize;
    className?: string;
};

// => // shared props of BaseComponentProps and Moveable Props
type Props<T extends {}> = Position & Partial<Size> & PositionTriggers & {
    paths: {                                                                    //
        base: string[];
        position: string[];
    };
    data: T;
    parentPosition: Position;
    triggerSelect?: () => void;                                                 //
    relatedPositions?: Dict<Position>;                                          //
    viewerInst?: Viewer;                                                        //
    netToolbar?: NetToolbarState;                                               //
    triggerChangeNetToolbarValue?: (value: any) => void;                        //
    triggerAddArc?: (arc: ArcElement) => void;                                  //
    triggerRemoveElement?: (category: NetCategory) => (id: string) => void;     //
    font?: FontSetting;                                                         //
    fontSize?: FontSize;                                                        //
    className?: string;                                                         //
};

export function createMovable<ComponentProps extends BaseComponentProps,
                              DataType extends {id: string}>(
    Component: React.ComponentType<ComponentProps>) {


    class Moveable extends React.Component<Props<DataType> & CanvasCtxData, Position> {

        public render() {
            const {className, paths, data,
                   parentPosition: {x: px, y: py}, x, y, width, height,
                   relatedPositions, zoom, pan,
                   viewerInst, triggerSelect,
                   triggerAddArc, triggerRemoveElement,
                   netToolbar, triggerChangeNetToolbarValue,
                   font, fontSize,
                   triggerPositionChanged=Utils.emptyFn} = this.props;

            const handleMouseDown = startMoving(
                x, y, zoom, pan,
                paths.base.concat(paths.position), triggerPositionChanged);

            return (
                <Component
                    {...data}
                    className={className}
                    paths={paths}
                    x={px+x}
                    y={py+y}
                    width={width}
                    height={height}
                    viewerInst={viewerInst}
                    netToolbar={netToolbar}
                    relatedPositions={relatedPositions}
                    font={font}
                    fontSize={fontSize}
                    triggerSelect={triggerSelect}
                    triggerAddArc={triggerAddArc}
                    triggerRemoveElement={triggerRemoveElement}
                    triggerChangeNetToolbarValue={triggerChangeNetToolbarValue}
                    triggerMouseDown={handleMouseDown}
                    triggerMouseUp={stopMoving}
                    triggerPositionChanged={triggerPositionChanged}
                />
            );
        }
    }

    return class extends React.Component<Props<DataType>, any> {
        public render() {
            return (
                <CanvasContext.Consumer>
                    {({zoom, pan}) => <Moveable {...this.props} zoom={zoom} pan={pan} />}
                </CanvasContext.Consumer>
            );
        }
    }
}
