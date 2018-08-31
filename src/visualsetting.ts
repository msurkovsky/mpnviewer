export interface FontSetting {
    face: string;
    size: {
        small: number;
        normal: number;
        big: number;
    };
    weight: number;
    spaceFactor: number;
    boldFactor: number;
}

export type FontSize = "small" | "normal" | "big";

const small = (fontSize: number) => (.7 * fontSize);
const big = (fontSize: number) => (1.3 * fontSize);

const bold = (fs: FontSetting): FontSetting => ({
    face: `${fs.face} bold`,
    size: {
        small: fs.size.small * fs.boldFactor,
        normal: fs.size.normal * fs.boldFactor,
        big: fs.size.big * fs.boldFactor,
    },
    weight: 700,
    spaceFactor: fs.spaceFactor * fs.boldFactor,
    boldFactor: 1.0, // bold cannot be "bolder"
});

const sansSerif = (fontSize: number): FontSetting => ({
    face: "sans-serif",
    size: {
        small: small(fontSize),
        normal: fontSize,
        big: big(fontSize),
    },
    weight: 400,
    spaceFactor: 0.38,
    boldFactor: 1.1595,
});

const monospace = (fontSize: number): FontSetting => ({
    face: "monospace",
    size: {
        small: small(fontSize),
        normal: fontSize,
        big: big(fontSize),
    },
    weight: 400,
    spaceFactor: 0.39 * 2, // x2 to skip the entire letter
    boldFactor: 1.039,
});

export const font = {
    description: sansSerif(12),
    code: monospace(11),
    keyword: bold(monospace(11)),
};

export function pt2px(v: number) {
    return v * 4 / 3; // by definition 'pt' and 'px' are in ration 4:3.
}
