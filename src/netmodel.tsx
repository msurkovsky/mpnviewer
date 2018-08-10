import {DataType, Expression, UID} from './types';


export interface TPlace {
    id: UID;
    name: string;
    type: DataType;
    initExpr: Expression;
}
