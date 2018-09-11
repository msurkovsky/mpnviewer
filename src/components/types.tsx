
import {CbChangeNetElementDataValue} from '../appcallbacktypes'
import {NetElementData} from '../netmodel'
import {Path} from '../types'

export interface NetElementSettingFormProps {
    data: NetElementData;
    path: Path;
    triggerChangesSubmit: CbChangeNetElementDataValue;
};

export type NetElementSettingForm = React.ComponentType<NetElementSettingFormProps>;
