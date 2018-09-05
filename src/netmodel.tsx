import {Dict, Omit, Position, Size} from './types'

export enum AMT {
    UNIT = "unit",
    BOOL = "bool",
    INTEGER = "integer",
}

export type DataType = AMT | string;

export enum PlaceDataLayout {
    QUEUE = "queue",
    MULTISET = "multiset",
}

export interface PlaceData {
    id: string;
    dataLayout: PlaceDataLayout;
    name?: string;
    type?: DataType;
    initExpr?: string;
    cpLabel?: string; // compound place
}

export interface TransitionData {
    id: string;
    name?: string;
    codeRef?: number | [number, number]; // specific reference or range
    guard?: string[];
}

export enum ArcType {
    SINGLE_HEADED = "singleheaded",
    DOUBLE_HEADED = "doubleheaded",
    SINGLE_HEADED_RO = "singleheadedro",
    DOUBLE_HEADED_RO = "doubleheadedro",
}

export interface ArcData {
    /* source: PlaceData | TransitionData; */
    /* destination: PlaceData | TransitionData; */
    id: string;
    expression: string;
    type: ArcType;
}

interface CommonAttributes {
    position: Position;
    size: Size;
    relatedPositions?: Dict<Position>;
}

export interface PlaceElement extends CommonAttributes {
    data: PlaceData;
}

export interface TransitionElement extends CommonAttributes {
    data: TransitionData,
}

export type NetElement = PlaceElement | TransitionElement;

export type UnpositionedNetElement = Omit<NetElement, "position">

export interface ArcElement {
    data: ArcData
    // Source and destination should be used to compute the start and
    // end position of an arrow.
    startElementPath: string[];
    endElementPath: string[];
    innerPoints: Position[]; // these are fixed and given (also relative to the parent)
    relatedPositions?: Dict<Position>; // position of arc's expression(s)
}

export type PartialArcElement = Omit<ArcElement, "endElementPath"> & {
    endPosition: Position;
};

export type NetCategory = "places" | "transitions" | "arcs";

export interface Net {
    places: Dict<PlaceElement>;
    transitions: Dict<TransitionElement>;
    arcs: Dict<ArcElement | PartialArcElement>;
}
