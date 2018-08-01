import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';
import {Net, Place} from './netmodel'
import {ViewElement} from './netview/netelement'

/* import {Place} from './netmodel/place' */
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
        <Net width={1000} height={500}>
            <ViewElement position={{x: 10, y: 100}} size={{width: 200, height: 200}}>
                <Place cx={50} cy={50} r={40} />
                <Place cx={100} cy={100} r={40} />
            </ViewElement>
        </Net>,
    document.getElementById('root') as HTMLElement
);
registerServiceWorker();
