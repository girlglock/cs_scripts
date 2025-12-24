import { Entity, Color, CSPlayerController, Instance as css } from "cs_script/point_script";
import { blips } from "../../_ext/utils/blips";
import { GameAssets } from "../../_ext/gameassets/gameassets";
import { StringMatcher } from "../../_ext/utils/stringmatcher";

export class ChatCommandHandler {
    private skyIndex: number = 0;

    setupCommands() {
        css.OnPlayerChat((event) => {
            this.handleChatCommand(event.player, event.text);
        });
    }

    handleChatCommand(speaker: CSPlayerController | undefined, text: string) {
        const commands: Record<string, (query?: string | null) => void> = {
            "!agent": (query) => this.handleAgentCommand(speaker, query ?? ""),
            "!knife": (query) => this.handleKnifeCommand(speaker, query ?? ""),
        };

        for (const [prefix, handler] of Object.entries(commands)) {
            if (text.startsWith(prefix)) {
                const query = text.substring(prefix.length).trim();
                handler(query || null);
                return;
            }
        }
    }

    handleAgentCommand(speaker: CSPlayerController | undefined, query: string) {
        if (!query) {
            blips.print(`Usage: !agent <partial name>"`);
            return;
        }

        const match = StringMatcher.findClosest(query, Object.values(GameAssets.customSkins));
        if (match && speaker instanceof CSPlayerController) {
            speaker.GetPlayerPawn()?.SetModel(match.path);
            blips.print(`Skin set to: ${match.name}"`);
        } else {
            blips.print(`No agent skin found for ${query}"`);
        }
    }

    handleKnifeCommand(speaker: CSPlayerController | undefined, query: string) {
        if (!query) {
            blips.print(`Usage: !knife <partial name>`);

            let line = "";
            Object.values(GameAssets.knifes).forEach((knife, i) => {
                line += knife.name.padEnd(20, " ");
                if ((i + 1) % 3 === 0) {
                    blips.print(line.trimEnd());
                    line = "";
                }
            });
            if (line) blips.print(line.trimEnd());

            return;
        }

        const match = StringMatcher.findClosest(query, Object.values(GameAssets.knifes));
        if (match && speaker instanceof CSPlayerController) {
            const pawn = speaker.GetPlayerPawn();
            if (!pawn) return;
            const pos = pawn.GetAbsOrigin();
            pawn.FindWeaponBySlot(2)?.Remove();
            css.ServerCommand(`subclass_create ${match.id} {"classname" "weapon_knife" "origin" "${pos.x} ${pos.y} ${pos.z}"}`);
            blips.print(`Knife skin set to: ${match.name}"`);
        } else {
            blips.print(`No knife skin found for ${query}"`);
        }
    }
}