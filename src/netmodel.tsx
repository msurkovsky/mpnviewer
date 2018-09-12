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

export enum NetElementType {
    PLACE = "place",
    TRANSITION = "transition",
    ARC = "arc",
}

export interface BaseNetElement {
    data: NetElementData;
    type: NetElementType;
    relatedPositions?: Dict<Position>;
}

export interface PlaceElement extends BaseNetElement, Positionable, Resizable {
    data: PlaceData;
}

export interface TransitionElement extends BaseNetElement, Positionable, Resizable {
    data: TransitionData,
}

export type NetNode = PlaceElement | TransitionElement;

export interface ArcElement extends BaseNetElement {
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

export type NetElement = PlaceElement
                       | TransitionElement
                       | PartialArcElement
                       | FullArcElement;

export enum NetCategory {
    PLACES = "places",
    TRANSITIONS = "transitions",
    ARCS = "arcs"
}

export interface NetStructure {
    places: Dict<PlaceElement>;
    transitions: Dict<TransitionElement>;
    arcs: Dict<ArcElement | PartialArcElement>;
}

export function isTransition(element: BaseNetElement): boolean {
    return element.type === "transition";
}

export function isPlace(element: BaseNetElement): boolean {
    return element.type === "place";
}

export function isArc(element: BaseNetElement): boolean {
    return element.type === "arc";
}

export function netElementTypeToCategory (type: NetElementType): NetCategory {
    return `${type}s` as NetCategory;
}
