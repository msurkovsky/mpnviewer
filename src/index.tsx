import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';

import {Net} from './new/net'
import {Place} from './new/place'
import {UID} from './new/types'
/* import {ViewElement} from './netview/netelement'*/

/* import {Place} from './netmodel/place' */
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
        <Net x={0} y={0} width={1000} height={500}>
            <Place place={{id: UID.get("a"), name: "a", type: "Bool", initExpr: ""}} bbox={{x: 50, y: 50, width: 40, height: 40}} />
        </Net>,
    document.getElementById('root') as HTMLElement
);
registerServiceWorker();
