import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';
import {Net} from './netmodel'
import {Place} from './netview/place'
/* import {ViewElement} from './netview/netelement'*/

/* import {Place} from './netmodel/place' */
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
        <Net width={1000} height={500}>
            <Place x={50} y={50} width={40} height={40} />
        </Net>,
    document.getElementById('root') as HTMLElement
);
registerServiceWorker();
