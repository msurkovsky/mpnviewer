
import {CbChangeNetElementData, CbChangeSize} from '../appcallbacktypes'
import {NetElementData} from '../netmodel'
import {Path, Size} from '../types'

export interface NetElementSettingFormProps {
    data: NetElementData;
    path: Path;
    triggerChangesSubmit: CbChangeNetElementData;
};

export type NetElementSettingForm = React.ComponentType<NetElementSettingFormProps>;


export interface ResizableSettingFormProps {
    size: Size;
    path: Path;
    triggerChangesSubmit: CbChangeSize;
}

export type ResizableSettingForm = React.ComponentType<ResizableSettingFormProps>;
