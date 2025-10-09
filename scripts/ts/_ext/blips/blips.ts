import { Instance as css, Vector } from "cs_script/point_script";

/**
 * blips are a silly substitute for colored chat messages
 * for singleplayer maps. This does not work in multiplayer.
 * 
 * usage:
 * - import { blips } from "./blips/blips";
 * - add `blips.update(currentGametime: number)` inside your think loop
 * - call `blips.print(text: string, soundName?: string)` to show a blip message
 */
class Blips {
    private static readonly oneTick = 0.015625;
    private static readonly beepSound = "Buttons.snd9";

    private chatMessages: {
        id: number;
        text: string;
        spawnTime: number;
        targetY: number;
        currentY: number;
        alpha: number;
    }[] = [];

    private nextMessageId: number = 1;

    /**
     * adds a new chat message to be displayed
     * @param text the message text, supports color tags like {red}, {green}, etc
     * @param soundName optional soundevent to play when message is added
     */
    print(text: string, soundPos?: Vector, soundName: string = Blips.beepSound): void {
        const gameTime = css.GetGameTime();
        const messageId = this.nextMessageId++;

        const message = {
            id: messageId,
            text,
            spawnTime: gameTime,
            targetY: 250,
            currentY: 250,
            alpha: 0,
        };

        for (let msg of this.chatMessages) {
            msg.targetY -= 15;
        }

        this.chatMessages.unshift(message);
        this.playSound(soundName, soundPos);
    }

    /**
     * renders chat messages
     * call this from inside your think loop with current game time passed into it
     * @param gameTime current game time from Instance.GetGameTime()
     */
    update(gameTime: number): void {
        const flyInDuration = 0.5;
        const displayDuration = 8;
        const flyOutDuration = 0.5;
        const totalDuration = displayDuration + flyOutDuration;

        for (let i = this.chatMessages.length - 1; i >= 0; i--) {
            const msg = this.chatMessages[i];
            const elapsed = gameTime - msg.spawnTime;

            if (elapsed > totalDuration) {
                this.chatMessages.splice(i, 1);
                continue;
            }

            let visibleChars = msg.text.length;
            let alpha = 255;

            if (elapsed < flyInDuration) {
                const progress = elapsed / flyInDuration;
                const easeProgress = Blips.easeOutCubic(progress);
                visibleChars = Math.floor(easeProgress * msg.text.length);
                alpha = Math.floor(easeProgress * 255);
            } else if (elapsed > displayDuration) {
                const outElapsed = elapsed - displayDuration;
                const progress = Math.min(outElapsed / flyOutDuration, 1.0);
                const easeProgress = Blips.easeInCubic(progress);
                visibleChars = Math.floor((1 - easeProgress) * msg.text.length);
                alpha = Math.floor((1 - easeProgress) * 255);
            }

            const yDiff = msg.targetY - msg.currentY;
            msg.currentY += yDiff * 0.2;

            const segments = Blips.parseColoredText(msg.text);
            let charCount = 0;
            let xOffset = 10;

            for (const segment of segments) {
                const segmentLength = segment.text.length;
                const segmentStart = charCount;

                if (visibleChars > segmentStart) {
                    const visibleInSegment = Math.min(visibleChars - segmentStart, segmentLength);
                    const displayText = segment.text.substring(0, Math.max(1, visibleInSegment));

                    const segmentColor = { ...segment.color, a: alpha };

                    css.DebugScreenText( {
                        text: displayText,
                        x: xOffset,
                        y: msg.currentY,
                        duration: Blips.oneTick,
                        color: segmentColor
                    });

                    xOffset += displayText.length * 7;
                }

                charCount += segmentLength;

                if (charCount >= visibleChars) break;
            }
        }
    }

    private playSound(soundName: string, pos: Vector | undefined): void {
        if (!pos) return;
        css.ServerCommand(`snd_sos_start_soundevent_at_pos ${soundName} ${pos?.x} ${pos?.y} ${pos?.z}`);
    }

    private static colorMap: Record<string, { r: number; g: number; b: number; a: number }> = {
        red: { r: 255, g: 50, b: 50, a: 255 },
        green: { r: 50, g: 255, b: 50, a: 255 },
        blue: { r: 50, g: 150, b: 255, a: 255 },
        yellow: { r: 255, g: 220, b: 100, a: 255 },
        orange: { r: 255, g: 165, b: 0, a: 255 },
        purple: { r: 200, g: 100, b: 255, a: 255 },
        cyan: { r: 0, g: 255, b: 255, a: 255 },
        white: { r: 255, g: 255, b: 255, a: 255 },
        gray: { r: 150, g: 150, b: 150, a: 255 },
        darkGray: { r: 100, g: 100, b: 100, a: 255 },
        black: { r: 0, g: 0, b: 0, a: 255 },
        darkRed: { r: 139, g: 0, b: 0, a: 255 },
        gold: { r: 255, g: 215, b: 0, a: 255 },
    };

    private static parseColoredText(text: string): { text: string; color: { r: number; g: number; b: number; a: number } }[] {
        const segments: { text: string; color: { r: number; g: number; b: number; a: number } }[] = [];
        const regex = /\{(\w+)\}/g;
        let lastIndex = 0;
        let currentColor = { r: 255, g: 220, b: 255, a: 255 };

        let match;
        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                segments.push({
                    text: text.substring(lastIndex, match.index),
                    color: currentColor
                });
            }

            const colorName = match[1].toLowerCase();
            if (this.colorMap[colorName]) {
                currentColor = this.colorMap[colorName];
            }

            lastIndex = regex.lastIndex;
        }

        if (lastIndex < text.length) {
            segments.push({
                text: text.substring(lastIndex),
                color: currentColor
            });
        }

        return segments;
    }

    private static easeOutCubic(t: number): number {
        return 1 - Math.pow(1 - t, 3);
    }

    private static easeInCubic(t: number): number {
        return t * t * t;
    }
}

export const blips = new Blips();