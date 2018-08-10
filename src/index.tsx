import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';

import {Net, Place} from './netview';
import {DataType, Expression, UID} from './types';

import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
        <Net x={0} y={0} width={1000} height={500}>
            <Place
                place={{
                    id: UID.get("a"),
                    name: "a",
                    type: DataType.get("Bool"),
                    initExpr: new Expression()}}
                bbox={{
                    x: 50,
                    y: 50,
                    width: 40,
                    height: 40}} />
        </Net>,
    document.getElementById('root') as HTMLElement
);
registerServiceWorker();
