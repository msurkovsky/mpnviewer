
import { NetElementDataChanged, PositionChanged } from './events';
import { NetCategory, NetElement } from './netmodel';
import { NetTool } from './toolbar';
import { ID, Path } from './types';

export type CbAddNetElement = (category: NetCategory) => (element: NetElement) => void;

export type CbRemoveNetElement = (category: NetCategory) => (id: ID) => void;

export type CbSelect = (path: Path | null) => () => void;

export type CbChangePosition = (evt: PositionChanged) => void;

export type CbChangeNetElementData = (evt: NetElementDataChanged) => void;

export type CbChangeToolbarValue = (value: any) => void;

export type CbChangeToolbarTools = (canvasTool: any, netTool: NetTool | null) => void;

export type CbSaveNet = () => void;

export type CbLoadNet = (evt: any) => void;
