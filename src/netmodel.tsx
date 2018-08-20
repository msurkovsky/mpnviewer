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
}
