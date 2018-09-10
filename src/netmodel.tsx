import {Dict, Position, Positionable, Resizable} from './types'

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

export type NetElementType = "place" | "transition" | "arc";

export interface PlaceData {
    id: string;
    dataLayout: PlaceDataLayout;
    name?: string;
    dataType?: DataType;
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

export type NetElementData = PlaceData | TransitionData | ArcData;

export interface NetElement {
    data: NetElementData;
    type: NetElementType;
    relatedPositions?: Dict<Position>;
}

export interface PlaceElement extends NetElement, Positionable, Resizable {
    data: PlaceData;
}

export interface TransitionElement extends NetElement, Positionable, Resizable {
    data: TransitionData,
}

export interface ArcElement extends NetElement {
    data: ArcData;
    startElementPath: string[];
    innerPoints: Position[];
}

export interface PartialArcElement extends ArcElement {
    endPosition: Position;
}

export interface FullArcElement extends ArcElement {
    endElementPath: string[];
}

export type NetCategory = "places" | "transitions" | "arcs";

export interface Net {
    places: Dict<PlaceElement>;
    transitions: Dict<TransitionElement>;
    arcs: Dict<ArcElement | PartialArcElement>;
}

export function isTransition(element: NetElement): boolean {
    return element.type === "transition";
}

export function isPlace(element: NetElement): boolean {
    return element.type === "place";
}

export function isArc(element: NetElement): boolean {
    return element.type === "arc";
}
