import {BoundingBox, DataType, Dict, Position} from './types'

export interface PlaceData {
    id: string;
    name: string;
    type: DataType;
    initExpr: string;
}

export interface Net {
    places: Dict<{data: PlaceData, bboxes: {major: BoundingBox, minors?: Dict<Position>}}>
}
