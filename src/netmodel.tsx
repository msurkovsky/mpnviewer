import {DataType, Dict, Position, Size} from './types'

export enum PlaceDataLayout {
    Queue = "queue",
    Multiset = "multiset",
}

export interface PlaceData {
    id: string;
    name: string;
    type: DataType;
    initExpr: string;
    dataLayout: PlaceDataLayout;
}

export interface TransitionData {
    id: string;
    name: string;
    code?: string[];
    guard?: string[];
}

export enum ArcType {
    SINGLE_HEADED = "singleheaded",
    DOUBLE_HEADED = "doubleheaded",
    SINGLE_HEADED_RO = "doubleheadedro",
    DOUBLE_HEADED_RO = "doubleheadedro",
}

export interface ArcData {
    /* source: PlaceData | TransitionData; */
    /* destination: PlaceData | TransitionData; */
    expression: string;
    type: ArcType;
}

export enum NetElement {
    Place,
    Transition
}

export interface Net {
    places: Dict<{
        data: PlaceData;
        position: Position;
        size: Size;
        relatedPositions?: Dict<Position>;
    }>;
    transitions: Dict<{
        data: TransitionData,
        position: Position;
        size: Size;
        relatedPositions?: Dict<Position>;
    }>;
    arcs: Array<{
        data: ArcData
        // Source and destination should be used to compute the start and
        // end position of an arrow.
        startElementPath: string[];
        endElementPath: string[];
        innerPoints: Position[]; // these are fixed and given (also relative to the parent)
        relatedPositions?: Dict<Position>; // position of arc's expression(s)
    }>;
}
