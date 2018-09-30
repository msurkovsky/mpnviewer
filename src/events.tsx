import {Path, Position, Size} from './types';

export interface NetPropertyChanged {
    "path": Path; // path of the property in the net structure
    "value": () => any; // a new value
}

export interface PositionChanged extends NetPropertyChanged {
    "value": () => Position;
}

export interface SizeChanged extends NetPropertyChanged {
    "value": () => Size;
}

export interface NetElementDataChanged extends NetPropertyChanged {
    "value": () => any; // NOTE: it can be any part of the net addresable by the path.
}
