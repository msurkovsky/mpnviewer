import { PositionChanged } from '../events';
import { startMoving, stopMoving } from '../features/move';
import { ID, Path, Position } from '../types';

export interface PositionableProps {
    canvasId: ID;
    path: Path;
    zoom: number;
    pan: Position;
    anchorPosition: Position;
    position: Position;
    changePosition: (evt: PositionChanged) => void;
}

export const onMouseDown = (
    props: PositionableProps,
    relativePositionPath: Path
) => (evt: React.MouseEvent) => {

    const { canvasId, path, zoom, pan, position, changePosition } = props;

    const { x, y } = position;
    const positionPath = path.concat(relativePositionPath);

    evt.stopPropagation();
    startMoving(canvasId,
        x, y,
        zoom, pan,
        positionPath, changePosition)(evt.nativeEvent);
}

export const onMouseUp = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    stopMoving(evt.nativeEvent);
}
