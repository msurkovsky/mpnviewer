import {NetElementData} from './netmodel';
import {Path, Position} from './types'

export interface PositionChanged {
    "path": Path;
    "value": Position;
}

export interface NetElementDataChanged {
    "path": Path;
    "value": NetElementData;
}
