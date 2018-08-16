import {Position} from './types'

export interface PositionChanged {
    "source": any;
    "old": Position;
    "new": Position;
}
