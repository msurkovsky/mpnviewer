import {Position} from './types'

export interface PositionChanged {
    "path": string[];
    "old": Position;
    "new": Position;
}
