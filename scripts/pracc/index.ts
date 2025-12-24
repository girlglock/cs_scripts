import { Instance as css, CSPlayerPawn, CSPlayerController, Vector, QAngle, CSWeaponBase } from "cs_script/point_script";
import { blips } from "../_ext/utils/blips";
import { HitGroup } from "../_ext/enums/hitgroups";
import { StringMatcher } from "../_ext/utils/stringmatcher";
import { GameAssets, SoundEvent } from "../_ext/gameassets/gameassets";
import { OnPlayerHurt, PlayerHurtEvent, RegisterAllEventListeners } from "../_ext/eventlisteners/eventlisteners";

type Rating = {
    name: string;
    color: string;
    soundEvent: SoundEvent;
};

const RATINGS: Record<string, Rating> = {
    PERF: { name: "PERF", color: "{green}", soundEvent: GameAssets.soundEvents.Beep01 },
    GOOD: { name: "GOOD", color: "{lightblue}", soundEvent: GameAssets.soundEvents.Beep01 },
    OKAK: { name: "OKAK", color: "{yellow}", soundEvent: GameAssets.soundEvents.Beep01 },
    MOVING: { name: "MOVING", color: "{red}", soundEvent: GameAssets.soundEvents.equitMusicKit }
};

interface Checkpoint {
    position: Vector;
    angles: QAngle;
}

const playerData = {
    lastVelocity: 0,
    peakVelocity: 0,
    shotsTaken: 0,
    perfectShots: 0,
    goodShots: 0,
    acceptableShots: 0,
    checkpoint: null as Checkpoint | null,
    strafesEnabled: true,
    damageReportEnabled: true,
    unlimitedAmmo: true
};

function getHorizontalVelocity(velocity: { x: number, y: number, z: number }): number {
    return Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
}

function getWeaponSpeed(weapon: CSWeaponBase): number {
    const weaponName = weapon.GetData().GetName();
    const weaponData = GameAssets.WeaponSpeeds[weaponName as keyof typeof GameAssets.WeaponSpeeds];
    return weaponData?.speed || 250;
}

function evalCounterStrafe(currentVelocity: number, weaponSpeed: number): { string: string; sound: SoundEvent; perfThreshold: number } {
    const maxThreshold = weaponSpeed * 0.34;
    const thresholds = {
        PERF: maxThreshold * 0.15,
        GOOD: maxThreshold * 0.88,
        OKAK: maxThreshold
    };
    
    let rating: Rating = RATINGS.MOVING;

    if (currentVelocity <= thresholds.PERF) {
        rating = RATINGS.PERF;
        playerData.perfectShots++;
    } else if (currentVelocity <= thresholds.GOOD) {
        rating = RATINGS.GOOD;
        playerData.goodShots++;
    } else if (currentVelocity <= thresholds.OKAK) {
        rating = RATINGS.OKAK;
        playerData.acceptableShots++;
    }

    return {string: `${rating.color}${rating.name}`, sound: rating.soundEvent, perfThreshold: thresholds.PERF };
}

function getStatsString(): string {
    if (playerData.shotsTaken === 0) return "";

    const perfectPercent = Math.round((playerData.perfectShots / playerData.shotsTaken) * 100);
    const goodPercent = Math.round((playerData.goodShots / playerData.shotsTaken) * 100);
    const acceptablePercent = Math.round((playerData.acceptableShots / playerData.shotsTaken) * 100);

    return `STRAFE STATS | {green}${perfectPercent}%{white} perfs | {lightblue}${goodPercent}%{white} goods | {yellow}${acceptablePercent}%{white} okaks`;
}

class CommandHandler {
    handleCommand(speaker: CSPlayerController | undefined, text: string) {
        if (!speaker) return;

        const args = text.trim().split(/\s+/);
        const command = args[0].toLowerCase();
        const query = args.slice(1).join(" ");

        const pawn = speaker.GetPlayerPawn();
        if (!pawn || !pawn.IsValid()) return;

        switch (command) {
            case "!cp":
                this.handleCheckpoint(pawn);
                break;
            case "!tp":
                this.handleTeleport(pawn);
                break;
            case "!strafes":
                this.handleStrafes();
                break;
            case "!damage":
                this.handleDamage();
                break;
            case "!god":
                this.handleGod(pawn);
                break;
            case "!bbox":
                this.handleBbox();
                break;
            case "!help":
                this.handleHelp();
                break;
            case "!knife":
                this.handleKnife(speaker, query);
                break;
            case "!agent":
                this.handleAgent(speaker, query);
                break;
            case "!nades":
                this.handleNades(pawn);
                break;
            case "!ammo":
                this.handleAmmo();
                break;
        }
    }

    handleCheckpoint(pawn: CSPlayerPawn) {
        playerData.checkpoint = { position: pawn.GetAbsOrigin(), angles: pawn.GetAbsAngles() };
        blips.print("{green}Checkpoint set!");
    }

    handleTeleport(pawn: CSPlayerPawn) {
        if (!playerData.checkpoint) {
            blips.print("{red}No checkpoint set! Use !cp first.");
            return;
        }
        pawn.Teleport({ position: playerData.checkpoint.position, angles: playerData.checkpoint.angles });
        blips.print("{green}Teleported to checkpoint!");
    }

    handleStrafes() {
        playerData.strafesEnabled = !playerData.strafesEnabled;
        blips.print(`{yellow}Counter strafes tracking ${playerData.strafesEnabled ? "{green}enabled" : "{red}disabled"}`);
    }

    handleDamage() {
        playerData.damageReportEnabled = !playerData.damageReportEnabled;
        blips.print(`{yellow}Damage report ${playerData.damageReportEnabled ? "{green}enabled" : "{red}disabled"}`);
    }

    handleGod(pawn: CSPlayerPawn) {
        const currentHealth = pawn.GetHealth();
        if (currentHealth > 100) {
            pawn.SetHealth(100);
            blips.print("{yellow}Health set to {white}100");
        } else {
            pawn.SetHealth(2147483647);
            blips.print("{green}God mode activated!");
        }
    }

    handleBbox() {
        css.ServerCommand(`ent_bbox !player`);
        blips.print("{yellow}Bounding box toggled!");
    }

    handleHelp() {
        const commands = [
            "{yellow}Available Commands:",
            "{green}!cp{white} - Set checkpoint at current position",
            "{green}!tp{white} - Teleport to checkpoint",
            "{green}!strafes{white} - Toggle counter strafe tracking",
            "{green}!damage{white} - Toggle damage report",
            "{green}!god{white} - Toggle god mode",
            "{green}!bbox{white} - Toggle bounding box",
            "{green}!knife <name>{white} - Change knife skin",
            "{green}!agent <name>{white} - Change agent skin",
            "{green}!nades{white} - Give all grenades",
            "{green}!ammo{white} - Toggle unlimited ammo"
        ];

        commands.forEach(cmd => blips.print(cmd));
    }

    handleKnife(speaker: CSPlayerController, query: string) {
        if (!query) {
            blips.print("{yellow}Usage: !knife <partial name>");

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
        if (match) {
            const pawn = speaker.GetPlayerPawn();
            if (!pawn) return;
            const pos = pawn.GetAbsOrigin();
            pawn.FindWeaponBySlot(2)?.Remove();
            css.ServerCommand(`subclass_create ${match.id} {"classname" "weapon_knife" "origin" "${pos.x} ${pos.y} ${pos.z}"}`);
            blips.print(`{green}Knife skin set to: {white}${match.name}`);
        } else {
            blips.print(`{red}No knife skin found for ${query}`);
        }
    }

    handleAgent(speaker: CSPlayerController, query: string) {
        if (!query) {
            blips.print("{yellow}Usage: !agent <partial name>");
            return;
        }

        const match = StringMatcher.findClosest(query, Object.values(GameAssets.customSkins));
        if (match) {
            speaker.GetPlayerPawn()?.SetModel(match.path);
            blips.print(`{green}Skin set to: {white}${match.name}`);
        } else {
            blips.print(`{red}No agent skin found for ${query}`);
        }
    }

    handleNades(pawn: CSPlayerPawn) {
        pawn.GiveNamedItem("weapon_hegrenade");
        pawn.GiveNamedItem("weapon_flashbang");
        pawn.GiveNamedItem("weapon_flashbang");
        pawn.GiveNamedItem("weapon_smokegrenade");
        pawn.GetTeamNumber() === 2
            ? pawn.GiveNamedItem("weapon_molotov")
            : pawn.GiveNamedItem("weapon_incgrenade");
        pawn.GiveNamedItem("weapon_decoy");
        blips.print("{green}All grenades given!");
    }

    handleAmmo() {
        playerData.unlimitedAmmo = !playerData.unlimitedAmmo;
        css.ServerCommand(`sv_infinite_ammo ${playerData.unlimitedAmmo ? "1" : "0"}`);
        blips.print(`{yellow}Unlimited ammo ${playerData.unlimitedAmmo ? "{green}enabled" : "{red}disabled"}`);
    }
}

const commandHandler = new CommandHandler();

let eventsRegistered = false;
let ticks = 0;

css.SetThink(() => {
    const gametime = css.GetGameTime();
    ticks++;
    
    if (ticks > 5 * 64) {
        if (!eventsRegistered) {
            RegisterAllEventListeners();
            eventsRegistered = true;
        }
        
        const player = css.GetPlayerController(0);
        if (player) {
            const pawn = player.GetPlayerPawn() as CSPlayerPawn;
            
            if (pawn.IsValid() && pawn.IsAlive()) {
                const velocity = pawn.GetAbsVelocity();
                const horizontalVel = getHorizontalVelocity(velocity);

                if (horizontalVel > playerData.peakVelocity) {
                    playerData.peakVelocity = horizontalVel;
                }

                if (horizontalVel < playerData.lastVelocity - 50) {
                    playerData.peakVelocity = playerData.lastVelocity;
                }

                playerData.lastVelocity = horizontalVel;

                if (playerData.strafesEnabled) {
                    const stats = getStatsString();
                    blips.printStatic(`${stats}`, { x: 10, y: 40 }, 0.015);
                }
                const now = new Date(); 
                blips.printStatic(`TIME: {yellow}${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`, { x: 10, y: 10 }, 0.015);
                blips.printStatic(`Date: ${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`, { x: 10, y: 20 }, 0.015);
                blips.printStatic(`VELO: {yellow}${getHorizontalVelocity(pawn.GetAbsVelocity()).toFixed(2)} u/s`, { x: 10, y: 30 }, 0.015);
            }
        }
    }
    
    blips.update(gametime);
    css.SetNextThink(gametime);
});

css.OnGunFire((event) => {
    const weapon = event.weapon;
    if (!weapon.IsValid()) return;

    const pawn = weapon.GetOwner();
    if (!pawn || !pawn.IsValid()) return;

    if (!playerData.strafesEnabled) return;

    const velocity = pawn.GetAbsVelocity();
    const horizontalVel = getHorizontalVelocity(velocity);
    const weaponSpeed = getWeaponSpeed(weapon);

    playerData.shotsTaken++;

    const rating = evalCounterStrafe(horizontalVel, weaponSpeed);
    
    const diff = Math.round(Math.abs(horizontalVel - rating.perfThreshold));
    const overUnder = horizontalVel > rating.perfThreshold ? `{red}over by ${diff} u/s` : `{green}under by ${diff} u/s`;

    const blipsMessage = `CS | ${rating.string} {white}(${Math.round(horizontalVel)} u/s) | ${overUnder}`;
    blips.print(blipsMessage, { withSound: true, soundEvent: rating.sound, soundPos: pawn.GetAbsOrigin() });

    playerData.peakVelocity = 0;
});

OnPlayerHurt((event: PlayerHurtEvent) => {
    if (!playerData.damageReportEnabled) return;

    const victimName = css.GetPlayerController(event.userid)?.GetPlayerName();
    const limb: string = HitGroup[event.hitgroup];

    const msg = `{red}DMG{white} | {red}[${event.weapon}]{white} {blue}${victimName}{white} | {yellow}${limb}{white} | {yellow}DMG - HP:${event.dmg_health} A:${event.dmg_armor}{white} | {green}LEFT - HP:${event.health} A:${event.armor}`;

    blips.print(msg);
});

css.OnPlayerChat((event) => {
    commandHandler.handleCommand(event.player, event.text);
});

css.OnRoundStart(() => {
    playerData.shotsTaken = 0;
    playerData.perfectShots = 0;
    playerData.goodShots = 0;
    playerData.acceptableShots = 0;
    playerData.peakVelocity = 0;
    playerData.lastVelocity = 0;
});

css.EntFireAtName({ name: "player_hurt", input: "Kill" });
css.ServerCommand('ammo_grenade_limit_total 9999');
css.ServerCommand('ent_create logic_eventlistener {"targetname" "player_hurt" "eventname" "player_hurt" "isenabled" "1"}');

css.SetNextThink(css.GetGameTime());
blips.print("practice script loaded! type !help for commands");