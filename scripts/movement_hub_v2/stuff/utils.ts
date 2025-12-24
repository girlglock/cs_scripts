import {Color, Instance as css} from "cs_script/point_script";
import {blips} from "../../_ext/utils/blips";

export class Utils {
    static getStringCenterOffset(text: string, charWidth = 7): number {
        return (text.length * charWidth) / 2;
    }

    static getJSColor(distance: number): string {
        switch (true) {
            case distance > 248.0:
                return "purple";
            case distance > 245.0:
                return "gold";
            case distance > 240.0:
                return "darkRed";
            case distance > 235.0:
                return "green";
            case distance > 230.0:
                return "blue";
            case distance > 190.0:
                return "gray";
            default:
                return "invalid";
        }
    }

    static setTrailColor(color: Color): void {
        css.FindEntityByName("mhTrailColor")?.Teleport({
            position: {x: color.r, y: 0, z: 0},
        });

        blips.print(`{white}ⓘ {yellow}Trail color changed to ${color.r}`);
    }

    static Q_rsqrt(number: number): number {
        // edge cases
        if (number === 0) return Infinity;  // 1 / sqrt(0) -> +Infinity
        if (number < 0) return NaN; // sqrt of negative -> NaN

        const threehalfs = 1.5;

        let x2: number, y: number;
        const buf = new ArrayBuffer(4);
        const f32 = new Float32Array(buf);
        const i32 = new Int32Array(buf);

        x2 = number * 0.5;
        y = number;

        f32[0] = y;
        let i = i32[0]; // evil floating point bit level hacking
        i = 0x5f3759df - (i >> 1);  // what the fuck?
        i32[0] = i;
        y = f32[0];

        y = y * (threehalfs - (x2 * y * y));  // 1st iteration
        //  y  = y * ( threehalfs - ( x2 * y * y ) );  // 2nd iteration, this can be removed

        return y;
    }

    static Q_sqrt(number: number): number {
        // edge cases
        if (number === 0) return 0;
        if (number < 0) return NaN;

        // for smol numbers
        if (number < 1e-10) return Math.sqrt(number);

        const buf = new ArrayBuffer(4);
        const f32 = new Float32Array(buf);
        const i32 = new Int32Array(buf);

        f32[0] = number;
        let i = i32[0];

        i = 0x1fbd1df5 + (i >> 1);
        i32[0] = i;
        let y = f32[0];

        y = 0.5 * (y + number / y);
        // y = 0.5 * (y + number / y);

        return y;
    }

}