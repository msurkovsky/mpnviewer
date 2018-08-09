
import {BoundingBox} from './types'

type constbbox = Readonly<BoundingBox>;

export function absolutizeBouningBoxes(abs: constbbox, relatives: constbbox[]): BoundingBox[] {
    return relatives.map(bbox => ({...bbox, x: bbox.x + abs.x, y: bbox.y + abs.y}));
}

export function computeBoundingBox(current: constbbox, bboxes: constbbox[]): BoundingBox {

    const maxBbox = {...current};

    for (const bbox of bboxes) {
        if (bbox.x < maxBbox.x) {
            maxBbox.x = bbox.x;
        }

        if (bbox.y < maxBbox.y) {
            maxBbox.y = bbox.y;
        }

        let cval = bbox.x + bbox.width;
        let maxval = maxBbox.x + maxBbox.width;
        if (cval > maxval) {
            maxBbox.width = cval;
        }

        cval = bbox.y + bbox.height;
        maxval = maxBbox.y + maxBbox.height;
        if (cval > maxval) {
            maxBbox.height = cval;
        }
    }

    maxBbox.width = maxBbox.width - maxBbox.x;
    maxBbox.height = maxBbox.height - maxBbox.y;
    return maxBbox;
}
