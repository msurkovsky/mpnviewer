
import {NetElementDataChanged} from '../events';
import {NetElementData} from '../netmodel';
import {Path, Size} from '../types';

export interface NetElementSettingFormProps {
    data: NetElementData;
    path: Path;
    submitChanges: (evt: NetElementDataChanged) => void;
};

export type NetElementSettingForm = React.ComponentType<NetElementSettingFormProps>;


export interface ResizableSettingFormProps {
    size: Size;
    path: Path;
    submitChanges: (evt: NetElementDataChanged) => void;
}

export type ResizableSettingForm = React.ComponentType<ResizableSettingFormProps>;
