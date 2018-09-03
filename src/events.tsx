import {Position} from './types'

export interface PositionChanged {
    "path": string[];
    "old": Position;
    "new": Position;
}

export interface ElementValueChanged {
    "path": string[];
    "value": any;
}
