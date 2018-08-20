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
}


export interface Net {
    places: Dict<{
        data: PlaceData;
        position: Position;
        size: Size;
        relatedPositions?: Dict<Position>;
    }>
}
