import {NetElementData} from './netmodel'
import {Position} from './types'

export interface PositionChanged {
    "path": string[];
    "old": Position;
    "new": Position;
}

export interface NetElementDataValueChanged {
    "path": string[];
    "value": {data: NetElementData};
}
