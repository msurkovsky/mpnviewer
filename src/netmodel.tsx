import {Expression, DataType, UID} from './types';


export interface TPlace {
    id: UID;
    name: string;
    type: DataType;
    initExpr: Expression;
}
