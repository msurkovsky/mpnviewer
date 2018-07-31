import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';
import {Net, Place} from './netmodel/' // #TODO: is possible to import from folder?
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
    <Net>
        <Place />
    </Net>,
    document.getElementById('root') as HTMLElement
);
registerServiceWorker();
