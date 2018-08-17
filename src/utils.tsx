import {lensPath, over, reject} from 'ramda'
import {Net as TNet} from './netmodel'

export const getId = ((id: number) => (): string => {
    return (id++).toString();
})(0);

export function computeDefaultMinors(net: TNet) {

    let newNet: TNet = net;

    for (const key of Object.keys(net.places)) {

        const path = lensPath(["places", key, "bboxes"]);
        newNet = over(path, ({major, minors}) => {
            if (!minors) {
                minors = {
                    type: {
                        x: major.width,
                        y: major.height,
                    },
                    initExpr: {
                        x: major.widht,
                        y: 0,
                    }
                }
            }
            return {major, minors};
        }, newNet);
    }

    return newNet;
};

export function excludeUndefined (obj: any): any {
    return reject((value) => value !== undefined, obj);
}
