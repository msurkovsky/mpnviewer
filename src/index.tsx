import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';

import {Net} from './new/net'
import {Place} from './new/place'
/* import {ViewElement} from './netview/netelement'*/

/* import {Place} from './netmodel/place' */
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
        <Net x={0} y={0} width={1000} height={500}>
            <Place x={0} y={0} relX={50} relY={50} width={40} height={40} />
        </Net>,
    document.getElementById('root') as HTMLElement
);
registerServiceWorker();
