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
}