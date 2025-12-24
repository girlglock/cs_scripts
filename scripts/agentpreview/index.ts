import {
    Instance,
    CSPlayerPawn,
    Entity,
    PointTemplate,
    BaseModelEntity,
    CSPlayerController
} from "cs_script/point_script";

import { blips } from "../_ext/utils/blips";

const CONFIG = {
    THINK_INTERVAL: 1 / 64,
};

class StringMatcher {
    static levenshteinDistance(a: string, b: string): number {
        const matrix: number[][] = Array.from({ length: b.length + 1 }, (_, i) => [i]);
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                matrix[i][j] = b[i - 1] === a[j - 1]
                    ? matrix[i - 1][j - 1]
                    : Math.min(matrix[i - 1][j - 1], matrix[i][j - 1], matrix[i - 1][j]) + 1;
            }
        }
        return matrix[b.length][a.length];
    }

    static findClosest<T extends Record<string, any>>(query: string, items: T[], nameProperty: keyof T = "name"): T | null {
        if (!query?.trim()) return null;

        const normalizedQuery = query.toLowerCase().trim();
        const threshold = Math.max(3, normalizedQuery.length * 0.4);

        for (const item of items) {
            const val = String(item[nameProperty]).toLowerCase();
            if (val.includes(normalizedQuery)) {
                return item;
            }
        }

        let bestMatch: T | null = null;
        let minDistance = Infinity;

        for (const item of items) {
            const distance = this.levenshteinDistance(normalizedQuery, String(item[nameProperty]).toLowerCase());
            if (distance < minDistance && distance <= threshold) {
                minDistance = distance;
                bestMatch = item;
            }
        }

        return bestMatch;
    }
}

type KnifeAsset = { name: string, id: string };
type SkinAsset = { name: string, path: string, team: "T" | "CT" };

class GameAssets {
    static knifes: KnifeAsset[] = [
        { name: "Bayonet", id: "500" },
        { name: "Butterfly Knife", id: "515" },
        { name: "Karambit", id: "507" },
        { name: "M9 Bayonet", id: "508" },
        { name: "Skeleton Knife", id: "525" },
        { name: "Talon Knife", id: "523" },
        { name: "Classic Knife", id: "503" },
        { name: "Stiletto Knife", id: "522" },
        { name: "Flip Knife", id: "505" },
        { name: "Ursus Knife", id: "519" },
        { name: "Paracord Knife", id: "517" },
        { name: "Survival Knife", id: "518" },
        { name: "Huntsman Knife", id: "509" },
        { name: "Falchion Knife", id: "512" },
        { name: "Bowie Knife", id: "514" },
        { name: "Shadow Daggers", id: "516" },
        { name: "Gut Knife", id: "506" },
        { name: "Navaja Knife", id: "520" },
        { name: "Nomad Knife", id: "521" },
        { name: "Kukri Knife", id: "526" },
    ];

    static customSkins: SkinAsset[] = [
        { name: "The Elite Mr. Muhlik | Elite Crew", path: "characters/models/tm_leet/tm_leet_variantf.vmdl", team: "T" },
        { name: "Prof. Shahmat | Elite Crew", path: "characters/models/tm_leet/tm_leet_varianti.vmdl", team: "T" },
        { name: "Osiris | Elite Crew", path: "characters/models/tm_leet/tm_leet_varianth.vmdl", team: "T" },
        { name: "Ground Rebel | Elite Crew", path: "characters/models/tm_leet/tm_leet_variantg.vmdl", team: "T" },
        { name: "Jungle Rebel | Elite Crew", path: "characters/models/tm_leet/tm_leet_variantj.vmdl", team: "T" },
        { name: "Special Agent Ava | FBI", path: "characters/models/ctm_fbi/ctm_fbi_variantb.vmdl", team: "CT" },
        { name: "Michael Syfers | FBI Sniper", path: "characters/models/ctm_fbi/ctm_fbi_varianth.vmdl", team: "CT" },
        { name: "Markus Delrow | FBI HRT", path: "characters/models/ctm_fbi/ctm_fbi_variantg.vmdl", team: "CT" },
        { name: "Operator | FBI SWAT", path: "characters/models/ctm_fbi/ctm_fbi_variantf.vmdl", team: "CT" },
        { name: "Seal Team 6 Soldier | NSWC SEAL", path: "characters/models/ctm_st6/ctm_st6_variante.vmdl", team: "CT" },
        { name: "'Two Times' McCoy | USAF TACP", path: "characters/models/ctm_st6/ctm_st6_variantm.vmdl", team: "CT" },
        { name: "Buckshot | NSWC SEAL", path: "characters/models/ctm_st6/ctm_st6_variantg.vmdl", team: "CT" },
        { name: "3rd Commando Company | KSK", path: "characters/models/ctm_st6/ctm_st6_variantk.vmdl", team: "CT" },
        { name: "Lt. Commander Ricksaw | NSWC SEAL", path: "characters/models/ctm_st6/ctm_st6_varianti.vmdl", team: "CT" },
        { name: "'Blueberries' Buckshot | NSWC SEAL", path: "characters/models/ctm_st6/ctm_st6_variantj.vmdl", team: "CT" },
        { name: "'Two Times' McCoy | TACP Cavalry", path: "characters/models/ctm_st6/ctm_st6_variantl.vmdl", team: "CT" },
        { name: "Primeiro Tenente | Brazilian 1st Battalion", path: "characters/models/ctm_st6/ctm_st6_variantn.vmdl", team: "CT" },
        { name: "Cmdr. Mae 'Dead Cold' Jamison | SWAT", path: "characters/models/ctm_swat/ctm_swat_variante.vmdl", team: "CT" },
        { name: "1st Lieutenant Farlow | SWAT", path: "characters/models/ctm_swat/ctm_swat_variantf.vmdl", team: "CT" },
        { name: "John 'Van Healen' Kask | SWAT", path: "characters/models/ctm_swat/ctm_swat_variantg.vmdl", team: "CT" },
        { name: "Bio-Haz Specialist | SWAT", path: "characters/models/ctm_swat/ctm_swat_varianth.vmdl", team: "CT" },
        { name: "Sergeant Bombson | SWAT", path: "characters/models/ctm_swat/ctm_swat_varianti.vmdl", team: "CT" },
        { name: "Chem-Haz Specialist | SWAT", path: "characters/models/ctm_swat/ctm_swat_variantj.vmdl", team: "CT" },
        { name: "Lieutenant 'Tree Hugger' Farlow | SWAT", path: "characters/models/ctm_swat/ctm_swat_variantk.vmdl", team: "CT" },
        { name: "Maximus | Sabre", path: "characters/models/tm_balkan/tm_balkan_varianti.vmdl", team: "T" },
        { name: "Dragomir | Sabre", path: "characters/models/tm_balkan/tm_balkan_variantf.vmdl", team: "T" },
        { name: "'The Doctor' Romanov | Sabre", path: "characters/models/tm_balkan/tm_balkan_varianth.vmdl", team: "T" },
        { name: "Rezan The Ready | Sabre", path: "characters/models/tm_balkan/tm_balkan_variantg.vmdl", team: "T" },
        { name: "Blackwolf | Sabre", path: "characters/models/tm_balkan/tm_balkan_variantj.vmdl", team: "T" },
        { name: "Rezan the Redshirt | Sabre", path: "characters/models/tm_balkan/tm_balkan_variantk.vmdl", team: "T" },
        { name: "Dragomir | Sabre Footsoldier", path: "characters/models/tm_balkan/tm_balkan_variantl.vmdl", team: "T" },
        { name: "B Squadron Officer | SAS", path: "characters/models/ctm_sas/ctm_sas_variantf.vmdl", team: "CT" },
        { name: "D Squadron Officer | NZSAS", path: "characters/models/ctm_sas/ctm_sas_variantg.vmdl", team: "CT" },
        { name: "Soldier | Phoenix", path: "characters/models/tm_phoenix/tm_phoenix_varianth.vmdl", team: "T" },
        { name: "Enforcer | Phoenix", path: "characters/models/tm_phoenix/tm_phoenix_variantf.vmdl", team: "T" },
        { name: "Slingshot | Phoenix", path: "characters/models/tm_phoenix/tm_phoenix_variantg.vmdl", team: "T" },
        { name: "Street Soldier | Phoenix", path: "characters/models/tm_phoenix/tm_phoenix_varianti.vmdl", team: "T" },
        { name: "Sir Bloody Miami Darryl | The Professionals", path: "characters/models/tm_professional/tm_professional_varf.vmdl", team: "T" },
        { name: "Sir Bloody Silent Darryl | The Professionals", path: "characters/models/tm_professional/tm_professional_varf1.vmdl", team: "T" },
        { name: "Sir Bloody Skullhead Darryl | The Professionals", path: "characters/models/tm_professional/tm_professional_varf2.vmdl", team: "T" },
        { name: "Sir Bloody Darryl Royale | The Professionals", path: "characters/models/tm_professional/tm_professional_varf3.vmdl", team: "T" },
        { name: "Sir Bloody Loudmouth Darryl | The Professionals", path: "characters/models/tm_professional/tm_professional_varf4.vmdl", team: "T" },
        { name: "Bloody Darryl The Strapped | The Professionals", path: "characters/models/tm_professional/tm_professional_varf5.vmdl", team: "T" },
        { name: "Safecracker Voltzmann | The Professionals", path: "characters/models/tm_professional/tm_professional_varg.vmdl", team: "T" },
        { name: "Little Kev | The Professionals", path: "characters/models/tm_professional/tm_professional_varh.vmdl", team: "T" },
        { name: "Number K | The Professionals", path: "characters/models/tm_professional/tm_professional_vari.vmdl", team: "T" },
        { name: "Getaway Sally | The Professionals", path: "characters/models/tm_professional/tm_professional_varj.vmdl", team: "T" },
        { name: "Sous-Lieutenant Medic | Gendarmerie Nationale", path: "characters/models/ctm_gendarmerie/ctm_gendarmerie_varianta.vmdl", team: "CT" },
        { name: "Chem-Haz Capitaine | Gendarmerie Nationale", path: "characters/models/ctm_gendarmerie/ctm_gendarmerie_variantb.vmdl", team: "CT" },
        { name: "Chef d'Escadron Rouchard | Gendarmerie Nationale", path: "characters/models/ctm_gendarmerie/ctm_gendarmerie_variantc.vmdl", team: "CT" },
        { name: "Aspirant | Gendarmerie Nationale", path: "characters/models/ctm_gendarmerie/ctm_gendarmerie_variantd.vmdl", team: "CT" },
        { name: "Officer Jacques Beltram | Gendarmerie Nationale", path: "characters/models/ctm_gendarmerie/ctm_gendarmerie_variante.vmdl", team: "CT" },
        { name: "Cmdr. Davida 'Goggles' Fernandez | SEAL Frogman", path: "characters/models/ctm_diver/ctm_diver_varianta.vmdl", team: "CT" },
        { name: "Cmdr. Frank 'Wet Sox' Baroud | SEAL Frogman", path: "characters/models/ctm_diver/ctm_diver_variantb.vmdl", team: "CT" },
        { name: "Lieutenant Rex Krikey | SEAL Frogman", path: "characters/models/ctm_diver/ctm_diver_variantc.vmdl", team: "CT" },
        { name: "Elite Trapper Solman | Guerrilla Warfare", path: "characters/models/tm_jungle_raider/tm_jungle_raider_varianta.vmdl", team: "T" },
        { name: "Crasswater The Forgotten | Guerrilla Warfare", path: "characters/models/tm_jungle_raider/tm_jungle_raider_variantb.vmdl", team: "T" },
        { name: "'Medium Rare' Crasswater | Guerrilla Warfare", path: "characters/models/tm_jungle_raider/tm_jungle_raider_variantb2.vmdl", team: "T" },
        { name: "Arno The Overgrown | Guerrilla Warfare", path: "characters/models/tm_jungle_raider/tm_jungle_raider_variantc.vmdl", team: "T" },
        { name: "Col. Mangos Dabisi | Guerrilla Warfare", path: "characters/models/tm_jungle_raider/tm_jungle_raider_variantd.vmdl", team: "T" },
        { name: "Vypa Sista of the Revolution | Guerrilla Warfare", path: "characters/models/tm_jungle_raider/tm_jungle_raider_variante.vmdl", team: "T" },
        { name: "Trapper Aggressor | Guerrilla Warfare", path: "characters/models/tm_jungle_raider/tm_jungle_raider_variantf.vmdl", team: "T" },
        { name: "Trapper | Guerrilla Warfare", path: "characters/models/tm_jungle_raider/tm_jungle_raider_variantf2.vmdl", team: "T" }
    ];
}

class ChatCommandHandler {
    private agentPreview: AgentPreview;

    constructor(agentPreview: AgentPreview) {
        this.agentPreview = agentPreview;
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        Instance.OnPlayerChat((event) => {
            this.handleChatCommand(event.player, event.text);
        });
    }

    handleChatCommand(speaker: CSPlayerController | undefined, text: string) {
        const commands: Record<string, (query?: string | null) => void> = {
            "!agent": (query) => this.handleAgentCommand(speaker, query ?? ""),
            "!knife": (query) => this.handleKnifeCommand(speaker, query ?? ""),
            "!sky": () => this.agentPreview.cycleSky(),
            "!tp": () => this.agentPreview.toggleThirdPerson(),
            "!ambient": () => Instance.ServerCommand("exec_async maps/async_q"),
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

        const match = StringMatcher.findClosest(query, GameAssets.customSkins);
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
            GameAssets.knifes.forEach((knife, i) => {
                line += knife.name.padEnd(20, " ");
                if ((i + 1) % 3 === 0) {
                    blips.print(line.trimEnd());
                    line = "";
                }
            });
            if (line) blips.print(line.trimEnd());

            return;
        }

        const match = StringMatcher.findClosest(query, GameAssets.knifes);
        if (match && speaker instanceof CSPlayerController) {
            const pawn = speaker.GetPlayerPawn();
            if (!pawn) return;
            const pos = pawn.GetAbsOrigin();
            pawn.FindWeaponBySlot(2)?.Remove();
            Instance.ServerCommand(`subclass_create ${match.id} {"classname" "weapon_knife" "origin" "${pos.x} ${pos.y} ${pos.z}"}`);
            blips.print(`Knife skin set to: ${match.name}"`);
        } else {
            blips.print(`No knife skin found for ${query}"`);
        }
    }
}

type RowData = { pos: ReturnType<typeof Vector.create>, angs: ReturnType<typeof QAngle.create> } | null;

class EntityFinder {
    static findRows(): { ct_row: RowData, t_row: RowData } {
        const ct_row = Instance.FindEntityByName("ct_row");
        const t_row = Instance.FindEntityByName("t_row");

        const isValidEntity = (entity: Entity | undefined): entity is Entity => !!entity;

        return {
            ct_row: isValidEntity(ct_row) ? {
                pos: ct_row.GetAbsOrigin(),
                angs: ct_row.GetAbsAngles()
            } : null,
            t_row: isValidEntity(t_row) ? {
                pos: t_row.GetAbsOrigin(),
                angs: t_row.GetAbsAngles()
            } : null
        };
    }
}

class SkinSpawner {
    private skinTemplate: PointTemplate | null = null;
    private offset = Vector.create(100, 0, 0);

    initialize(): boolean {
        const found = Instance.FindEntityByName("agentDummyTemplate");
        if (found instanceof PointTemplate) {
            this.skinTemplate = found;
            return true;
        }
        return false;
    }

    spawnSkinsForTeam(row: RowData, skins: SkinAsset[], teamLabel: "CT" | "T") {
        if (!this.skinTemplate || !row) return;

        this.offset = Vector.create(teamLabel === "T" ? 0 : 100, 0, 0);

        skins.forEach((skin) => {
            const spawned = this.skinTemplate?.ForceSpawn(Vector.add(row.pos, this.offset), row.angs);
            if (!spawned) return;

            const [dummy, trigger, text1, text2] = spawned;
            this.offset = Vector.add(this.offset, Vector.create(100, 0, 0));

            if (!(dummy instanceof BaseModelEntity) || !(trigger instanceof Entity)) return;

            dummy.SetModel(skin.path);

            Instance.ConnectOutput(trigger, "OnStartTouch", (inputData) => {
                if (inputData.activator instanceof CSPlayerPawn) {
                    inputData.activator.SetModel(skin.path);
                    blips.print(`Skin set to: ${skin.name}`);
                }
            });

            if (text1) Instance.EntFireAtTarget({ target: text1, input: "SetMessage", value: skin.name });
            if (text2) Instance.EntFireAtTarget({ target: text2, input: "SetMessage", value: skin.name });

            Instance.Msg(`Spawned ${teamLabel} skin: ${skin.name}`);
        });
    }
}

class AgentPreview {
    private skyIndex = 0;
    private thirdPerson = false;
    private skinSpawner = new SkinSpawner();
    private chatHandler = new ChatCommandHandler(this);
    private commands: string[] = [
        "!tp - Toggle Thirdperson",
        "!sky - Cycle skybox",
        "!agent <agent name>",
        "!knife <knife name>",
        "!ambient - Remove all ambient. This stays until game reboot"
    ];
    private currentCommandIndex = 0;

    think() {
        const currentTime = Instance.GetGameTime();
        const commandStr = this.commands[this.currentCommandIndex];

        if (currentTime % 3 === 0) {
            Instance.EntFireAtName({
                name: "commandtext",
                input: "SetMessage",
                value: "Commands:\n" + commandStr
            });
        }

        blips.update(currentTime);

        this.currentCommandIndex = (this.currentCommandIndex + 1) % this.commands.length;
        Instance.SetNextThink(currentTime + CONFIG.THINK_INTERVAL);
    }

    init() {
        if (!this.skinSpawner.initialize()) return;

        const { ct_row, t_row } = EntityFinder.findRows();
        const ctSkins = GameAssets.customSkins.filter(s => s.team === "CT");
        const tSkins = GameAssets.customSkins.filter(s => s.team === "T");

        this.skinSpawner.spawnSkinsForTeam(ct_row, ctSkins, "CT");
        this.skinSpawner.spawnSkinsForTeam(t_row, tSkins, "T");
        blips.print(`Commands:`);
        for (const command of this.commands) {
            blips.print(command);
        }

        Instance.ServerCommand("sv_disable_radar");
    }

    cycleSky() {
        this.skyIndex = (this.skyIndex + 1) % 23;
        Instance.EntFireAtName({ name: "sky_*", input: "Disable" });
        Instance.EntFireAtName({ name: `sky_${this.skyIndex}`, input: "Enable" });
    }

    toggleThirdPerson() {
        this.thirdPerson = !this.thirdPerson;
        Instance.ServerCommand(this.thirdPerson ? "thirdperson" : "firstperson");
        blips.print(`Thirdperson: ${this.thirdPerson}"`);
    }
}

class Vector {
    static nullV = { x: 16000, y: 16000, z: 16000 };
    static zeroV = { x: 0, y: 0, z: 0 };

    static create(x = 0, y = 0, z = 0) { return { x, y, z }; }
    static add(a: any, b: any) { return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }; }
    static sub(a: any, b: any) { return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }; }
    static scale(v: any, s: number) { return { x: v.x * s, y: v.y * s, z: v.z * s }; }
    static length3D(v: any) { return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z); }
    static normalize(v: any) { const len = this.length3D(v); return len === 0 ? this.zeroV : this.scale(v, 1 / len); }
}

class QAngle {
    static zero = { pitch: 0, yaw: 0, roll: 0 };
    static create(pitch = 0, yaw = 0, roll = 0) { return { pitch, yaw, roll }; }
}

const agentPreview = new AgentPreview();
Instance.OnRoundStart(() => agentPreview.init());
Instance.SetThink(() => agentPreview.think());
Instance.SetNextThink(CONFIG.THINK_INTERVAL);