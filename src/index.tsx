import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';

import {Net} from './netview';
import {getId, computeDefaultMinors} from './utils';
import {Net as TNet} from './netmodel';

import registerServiceWorker from './registerServiceWorker';

const net: TNet = {
    places: {
        "a": {
            data: {
                id: getId(),
                name: "a",
                type: "Bool",
                initExpr: "",
            },
            bboxes: {
                major: {
                    x: 50,
                    y: 50,
                    width: 40,
                    height: 40,
                },
            }
        },
        "b": {
            data: {
                id: getId(),
                name: "b",
                type: "Integer",
                initExpr: "3",
            },
            bboxes: {
                major: {
                    x: 120,
                    y: 120,
                    width: 40,
                    height: 40,
                },
            }
        }
    }
}

ReactDOM.render(
    <Net net={computeDefaultMinors(net)} x={0} y={0} width={1000} height={500} />,
    document.getElementById('root') as HTMLElement
);

registerServiceWorker();
