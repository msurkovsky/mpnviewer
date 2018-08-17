import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';

import {Net as TNet} from './netmodel';
import {Net} from './netview';
import {fillDefaultRelatedPositions, getId} from './utils';

import registerServiceWorker from './registerServiceWorker';

const net: TNet = fillDefaultRelatedPositions({
    places: {
        "a": {
            data: {
                id: getId(),
                name: "a",
                type: "Bool",
                initExpr: "",
            },
            position: { x: 50, y: 50 },
            size: { width: 40, height: 40 },
        },
        "b": {
            data: {
                id: getId(),
                name: "b",
                type: "Integer",
                initExpr: "3",
            },
            position: { x: 120, y: 120 },
            size: { width: 80, height: 50 },
        }
    }
});

ReactDOM.render(
    <Net net={net} x={0} y={0} width={1000} height={500} />,
    document.getElementById('root') as HTMLElement
);

registerServiceWorker();
