import {lensPath, over} from 'ramda'
import {Net as TNet} from './netmodel'

export const getId = ((id: number) => (): string => {
    return (id++).toString();
})(0);

export function fillDefaultRelatedPositions(net: TNet) {

    let newNet: TNet = net;

    for (const key of Object.keys(net.places)) {

        const path = lensPath(["places", key]);

        newNet = over(path, ({data, position, size, relatedPositions: defined}) => {
            const defaultPositions = { // TODO: put into a common function
                "type": {x: size.width, y: size.height},
                "initExpr": {x: size.width, y: 0},
            };

            const relatedPositions = {...defined};
            for (const elem of Object.keys(defaultPositions)) {
                if (!relatedPositions[elem]) { // TODO: use better name then `elem`
                    relatedPositions[elem] = defaultPositions[elem];
                }
            }
            return {data, position, size, relatedPositions};
        }, newNet);
    }

    return newNet;
};
