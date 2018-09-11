import {NetElementData} from './netmodel';
import {Path, Position, Size} from './types';

export interface PositionChanged {
    "path": Path;
    "value": Position;
}

export interface SizeChanged {
    "path": Path;
    "value": Size;
}

export interface NetElementDataChanged {
    "path": Path;
    "value": NetElementData;
}
