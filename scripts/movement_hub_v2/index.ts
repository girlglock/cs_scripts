import {
    Color,
    CSPlayerController,
    CSPlayerPawn,
    Entity,
    Instance as css,
    PointTemplate,
    TraceResult,
    Vector
} from "cs_script/point_script";
import {Euler, Vec3, Vector3Utils} from "@s2ze/math";
import {
    OnPlayerHurt,
    OnPlayerSpawn,
    OnServerCvar,
    PlayerHurtEvent,
    PlayerSpawnEvent,
    RegisterAllEventListeners,
    ServerCvarEvent
} from '../_ext/eventlisteners/eventlisteners';
import {blips} from "../_ext/utils/blips";
import {HitGroup} from "../_ext/enums/hitgroups";

import {Checkpoint, Destination, GameMode, GroundState, TrialData} from "./stuff/types";
import {config, mapConfigs, MapName, nerdStuff} from "./stuff/configs";
import {Utils} from "./stuff/utils";
import { ChatCommandHandler } from "./stuff/commands";
import { GameAssets, SoundEvent } from "../_ext/gameassets/gameassets";

class Player {
    trials: TrialData = {
        currentStage: -1,
        timer: {
            running: false,
            ticks: 0,
            fails: 0,
        },
        pb: {
            time: 0,
            fails: 0,
        },
        clipBlocks: [],
        resetBlocks: [],
    };

    pawn: CSPlayerPawn | undefined = undefined;
    controller: CSPlayerController | undefined = undefined;
    userId: number = 0;
    currentMode: GameMode = "freeroam";

    kz = {
        checkpoints: {
            pos: Vec3.Zero,
            ang: Euler.Zero,
            beforeTp: {pos: Vec3.Zero, ang: Euler.Zero, wasInAir: false},
            justTeleported: false,
        } as Checkpoint,
        lastOnGround: {
            onGround: true,
            pos: Vec3.Zero,
            ang: Euler.Zero,
            vel: Vec3.Zero,
            frames: 0,
        } as GroundState,
        velo: Vec3.Zero,
        lastVelo: Vec3.Zero,
    };

    startTimer(): void {
        this.trials.timer.running = true;
        this.trials.timer.ticks = 0;
    }

    stopTimer(): void {
        this.trials.timer.running = false;
    }

    startTrial(stage: number): void {
        this.trials.currentStage = stage;
    }

    nextStage(): void {
        this.trials.currentStage++;
    }

    endTrial(): void {
        this.trials.currentStage = -1;
    }

    setCheckpoint(): void {
        if (!this.pawn) return;

        this.kz.checkpoints.pos = this.kz.lastOnGround.pos;
        this.kz.checkpoints.ang = this.kz.lastOnGround.ang;
        blips.print("{white}ⓘ {yellow}Checkpoint set!");
    }

    tpCheckpoint(): void {
        if (!this.pawn || this.kz.checkpoints.pos === Vec3.Zero) return;

        const pos = this.pawn.GetAbsOrigin() as Vec3;
        const ang = this.pawn.GetEyeAngles() as Euler;
        const distanceToCheckpoint: number = Vector3Utils.distance(this.kz.checkpoints.pos, pos);
        const isAtCheckpoint: boolean = distanceToCheckpoint < config.CHECKPOINT_DISTANCE_THRESHOLD;

        if (isAtCheckpoint && this.kz.checkpoints.beforeTp.pos !== Vec3.Zero && !this.kz.checkpoints.beforeTp.wasInAir) {
            this.teleportTo(this.kz.checkpoints.beforeTp.pos, this.kz.checkpoints.beforeTp.ang);
            blips.print("{white}ⓘ {yellow}Returning to position before last teleport...");
            return;
        }

        if (isAtCheckpoint) {
            blips.print("{red}❌ {yellow}You are already at the checkpoint!");
            if (this.kz.checkpoints.beforeTp.wasInAir) {
                blips.print("{red}❌ {yellow}Cannot return to position before last teleport as you were in air!");
            }
            return;
        }

        this.kz.checkpoints.beforeTp = {pos, ang, wasInAir: !this.kz.lastOnGround.onGround};
        this.kz.checkpoints.justTeleported = true;
        this.kz.lastOnGround.onGround = true;

        this.teleportTo(this.kz.checkpoints.pos, this.kz.checkpoints.ang);
        blips.print("{white}ⓘ {yellow}Teleporting to last checkpoint...");
    }

    updateMovementStuff(): void {
        if (!this.pawn) return;

        const isOnGround: boolean = this.pawn.GetGroundEntity() !== undefined;
        const velo = this.pawn.GetAbsVelocity() as Vec3;
        const pos = this.pawn.GetAbsOrigin() as Vec3;
        const ang = this.pawn.GetEyeAngles() as Euler;

        if (this.kz.lastOnGround.frames > 4) {
            this.handleLandingJump(isOnGround, pos);
        }
        this.updateGroundState(isOnGround, pos, ang, velo);
    }

    updateVeloHUD(): void {
        const velo2D: string = Vector3Utils.length2D(this.kz.velo).toFixed(2);
        const lastVelo2D: string = Vector3Utils.length2D(this.kz.lastVelo).toFixed(2);
        const color: Color = this.getVelocityColor(parseFloat(velo2D), parseFloat(lastVelo2D));

        this.renderVelocityText(velo2D, 50, color);
    }

    setMaxHealth(): void {
        this.pawn?.SetMaxHealth(nerdStuff.maxInt);
        this.pawn?.SetHealth(nerdStuff.maxInt);
    }

    onJump(): void {
        if (!this.pawn) return;
        this.kz.lastOnGround.vel = this.pawn.GetAbsVelocity() as Vec3;
        this.kz.lastOnGround.pos = this.pawn.GetAbsOrigin() as Vec3;
        this.kz.lastOnGround.ang = this.pawn.GetEyeAngles() as Euler;
        if (!this.kz.lastOnGround.onGround) this.kz.lastOnGround.frames = 0;
        if (this.kz.lastOnGround.onGround) {
            this.kz.lastOnGround.onGround = false;
        }
    }

    traceToGround(pawn: CSPlayerPawn | undefined): TraceResult | null {
        const start = pawn?.GetAbsOrigin() as Vec3;
        const end: Vec3 = Vector3Utils.add(start, new Vec3(0, 0, 32));
        const trace: TraceResult = css.TraceBox({
            start: Vector3Utils.add(start, new Vec3(0, 0, 36)),
            end,
            mins: new Vec3(-16, -16, -36),
            maxs: new Vec3(16, 16, 36),
            ignorePlayers: true,
        });

        css.DebugScreenText({
            text: `Trace to ground: ${trace.fraction.toFixed(2)} | Hit: ${trace.didHit} | HitPos: ${trace.end.x.toFixed(2)}, ${trace.end.y.toFixed(2)}, ${trace.end.z.toFixed(2)} | HitNormal: ${trace.normal.x.toFixed(2)}, ${trace.normal.y.toFixed(2)}, ${trace.normal.z.toFixed(2)}`,
            x: 10,
            y: 30,
            duration: nerdStuff.oneTick,
            color: {r: 255, g: 255, b: 255, a: 255}
        });

        css.DebugScreenText({
            text: `Pawn Pos: ${start.x.toFixed(2)}, ${start.y.toFixed(2)}, ${start.z.toFixed(2)}`,
            x: 10,
            y: 40,
            duration: nerdStuff.oneTick,
            color: {r: 255, g: 255, b: 255, a: 255}
        });

        css.DebugBox({
            mins: Vector3Utils.add(trace.end, new Vec3(-16, -16, -36)),
            maxs: Vector3Utils.add(trace.end, new Vec3(16, 16, 36)),
            color: {r: 0, g: 0, b: 255, a: 255},
            duration: nerdStuff.oneTick,
        });

        return trace;
    }

    private teleportTo(position: Vec3, angles: Euler): void {
        this.pawn?.Teleport({position, angles, velocity: Vec3.Zero});
    }

    private handleLandingJump(isOnGround: boolean, pos: Vec3): void {
        if (this.kz.lastOnGround.onGround || !isOnGround || this.kz.checkpoints.justTeleported) {
            return;
        }

        const heightDiff: number = Math.abs(this.kz.lastOnGround.pos.z - pos.z);
        if (heightDiff >= config.HEIGHT_THRESHOLD) return;

        const distance: number = Vector3Utils.distance2D(this.kz.lastOnGround.pos, pos) + config.DISTANCE_OFFSET;
        const color: string = Utils.getJSColor(distance);

        if (color !== "invalid") {
            const preSpeed: string = Vector3Utils.length2D(this.kz.lastOnGround.vel).toFixed(2);
            blips.print(
                `{blue}= ( • . • ) = {white}Distance: {${color}}${distance.toFixed(2)}{white}u | Pre: {green}${preSpeed}{white}u`,
                { withSound: true, soundEvent: GameAssets.soundEvents.laugh, soundPos: pos }
            );
        }
    }

    private updateGroundState(isOnGround: boolean, pos: Vec3, ang: Euler, velo: Vec3): void {
        const trace: TraceResult | null = this.traceToGround(this.pawn);

        this.kz.lastVelo = this.kz.velo;
        this.kz.velo = velo;


        if (this.kz.checkpoints.justTeleported) {
            this.kz.checkpoints.justTeleported = false;
        }

        if (isOnGround) {
            this.kz.lastOnGround.pos = pos;
            this.kz.lastOnGround.ang = ang;
            this.kz.lastOnGround.vel = velo;
            if (this.kz.lastOnGround.onGround && isOnGround) {
                this.kz.lastOnGround.frames++;
            } else {
                this.kz.lastOnGround.frames = 0;
            }
        }

        this.kz.lastOnGround.onGround = isOnGround || trace?.fraction! < 0.3;
    }

    private getVelocityColor(current: number, last: number): Color {
        if (current > last) return {r: 150, g: 150, b: 255, a: 255};
        if (current < last) return {r: 255, g: 150, b: 150, a: 255};
        return {r: 255, g: 255, b: 255, a: 255};
    }

    private renderVelocityText(velocity: string, yOffset: number, color: Color): void {
        const veloText: string = velocity.padStart(6, "0");
        css.DebugScreenText({
            text: veloText,
            x: (1920 / 2) - Utils.getStringCenterOffset(veloText),
            y: (1080 / 2) + yOffset,
            duration: nerdStuff.oneTick,
            color
        });

        const preVelo: string = !this.kz.lastOnGround.onGround
            ? Vector3Utils.length2D(this.kz.lastOnGround.vel).toFixed(2).padStart(6, "0")
            : "---. --";
        const preText: string = `(${preVelo})`;

        css.DebugScreenText({
            text: preText,
            x: (1920 / 2) - Utils.getStringCenterOffset(preText),
            y: (1080 / 2) + yOffset + 10,
            duration: nerdStuff.oneTick,
            color
        });
    }
}

class Server {
    date: Date = new Date();
    isDebug: boolean = false;
    currentTick: number = 0;
    lastRadioSecond: number = -1;
    currentMapName: string = "";
    initDone: boolean = false;

    entities = {
        steamHappyTemplate: undefined as PointTemplate | undefined,
        trailTemplate: undefined as PointTemplate | undefined,

        activeTrails: [] as { trail: Entity; identifier: Entity }[],
    };

    destinations = {
        freeroam: {
            name: "Free Roam",
            pos: Vec3.Zero,
            ang: Euler.Zero,
        },
        hub: {
            name: "Hub",
            pos: Vec3.Zero,
            ang: Euler.Zero,
        },
    };

    think(): void {
        this.currentTick++;

        if (!this.initDone && !css.IsWarmupPeriod() && css.GetGameTime() > 5) {
            this.initialize();
        } else if (this.initDone) {
            this.updateGame();
        }

        css.SetNextThink(css.GetGameTime() + nerdStuff.oneTick);
    }

    spawnTrail(pawn: CSPlayerPawn | undefined, name: string): void {
        if (!pawn || !this.entities.trailTemplate) return;

        const trail: Entity | undefined = this.entities.trailTemplate.ForceSpawn(pawn.GetAbsOrigin())?.[0];
        if (!(trail instanceof Entity)) return;

        trail.SetEntityName(name);

        css.EntFireAtTarget({target: trail, input: "start"});
        css.EntFireAtTarget({target: trail, input: "FollowEntity", value: pawn.GetEntityName()});

        this.entities.activeTrails.push({
            trail,
            identifier: pawn,
        });
    }

    findEntities(): void {
        this.findPlayerEntities();
        this.findMapEntities();
        this.setupButtons();
    }

    switchMode(mode: GameMode, destination: Destination): void {
        if (!player.pawn || !destination) return;

        if (destination) {
            player.pawn.Teleport({
                position: destination.pos,
                velocity: Vec3.Zero,
                angles: destination.ang,
            });
        }

        player.currentMode = mode;
        if (destination.name) blips.print(`{white}ⓘ {yellow}Entering ${destination.name}...`);
    }

    updateRadio(gameTime: number): void {
        const currentSecond: number = Math.floor(gameTime);
        if (currentSecond === this.lastRadioSecond) return;

        this.lastRadioSecond = currentSecond;
        const isEvenSecond: boolean = currentSecond % 2 === 0;

        if (player.currentMode === "freeroam") {
            css.ServerCommand(isEvenSecond ? "radio" : "radio1");
        } else if (player.currentMode === "trials" || player.currentMode === "routes") {
            css.ServerCommand(isEvenSecond ? "radio2" : "radio3");
        }
    }

    sendChat(text: string): void {
        css.ServerCommand("say_team " + text);
        this.playSound(GameAssets.soundEvents.ticker);
    }

    playSound(soundEvent: SoundEvent): void {
        const pos: Vector = player.pawn?.GetAbsOrigin() || Vec3.Zero;
        css.ServerCommand(`snd_sos_start_soundevent_at_pos ${soundEvent.path} ${pos.x} ${pos.y} ${pos.z}`);
    }

    handleCvarChange(cvarname: string): void {
        if (config.BANNED_CVARS.has(cvarname)) {
            css.ServerCommand(`kickid 0`);
        }
    }

    handlePlayerHurt(data: any): void {
        const attackerName: string | undefined = css.GetPlayerController(data.attacker)?.GetPlayerName();
        const victimName: string | undefined = css.GetPlayerController(data.userid)?.GetPlayerName();
        const limb: string = HitGroup[data.hitgroup];

        const msg = `{red}${attackerName}{white} {red}[${data.weapon}]{white} {blue}${victimName}{white} (${limb}) | {yellow}DMG - HP:${data.dmg_health} A:${data.dmg_armor}{white} | {green}LEFT - HP:${data.health} A:${data.armor}`
            .trim()
            .replace(/\s+/g, ' ');

        css.Msg(msg);
        blips.print(msg);
    }

    private initialize(): void {
        RegisterAllEventListeners();
        this.findEntities();

        player.setMaxHealth();
        player.pawn?.Teleport({
            position: this.destinations.hub.pos,
            angles: this.destinations.hub.ang,
            velocity: Vec3.Zero
        });

        this.spawnTrail(player.pawn, "playerTrail");

        player.currentMode = "hub";
        this.initDone = true;

        this.printWelcomeMessage();
    }

    private updateGame(): void {
        const gameTime: number = css.GetGameTime();

        this.updateRadio(gameTime);
        blips.update(gameTime);
        player.updateMovementStuff();
        player.updateVeloHUD();
        this.renderDebugInfo();
    }

    private printWelcomeMessage(): void {
        for (let i: number = 0; i < 3; i++) {
            blips.print("{white}ⓘ {yellow}Welcome to Movement Hub V2!");
        }
    }

    private renderDebugInfo(): void {
        css.DebugScreenText({
            text: `Movement Hub V2 | Map: ${this.currentMapName} | Mode: ${player.currentMode} | OnGround: ${player.kz.lastOnGround.onGround}`,
            x: 10,
            y: 10,
            duration: nerdStuff.oneTick,
            color: {r: 255, g: 255, b: 255, a: 255}
        });
    }

    private findPlayerEntities(): void {
        player.controller = css.GetPlayerController(0);
        player.pawn = player.controller?.GetPlayerPawn();

        player.controller?.SetEntityName("playerController");
        player.pawn?.SetEntityName("playerPawn");
    }

    private findMapEntities(): void {
        const currentMapConfig = mapConfigs[this.currentMapName as MapName];
        this.destinations.freeroam.pos = currentMapConfig.freeroamSpawn.pos;
        this.destinations.freeroam.ang = currentMapConfig.freeroamSpawn.ang;

        const steamHappyTemplate: Entity | undefined = css.FindEntityByName("templateSteamHappy");
        const hubSpawn: Entity | undefined = css.FindEntityByName("tp_hub");
        const trailTemplate: Entity | undefined = css.FindEntityByName("templateTrail");

        if (
            hubSpawn &&
            steamHappyTemplate instanceof PointTemplate &&
            trailTemplate instanceof PointTemplate
        ) {
            this.destinations.hub.pos = hubSpawn.GetAbsOrigin() as Vec3;
            this.entities.steamHappyTemplate = steamHappyTemplate;
            this.entities.trailTemplate = trailTemplate;
        } else {
            blips.print("{red}❌ {yellow}Some essential entities are missing in the map! The script may not function correctly.");
        }

    }

    private setupButtons(): void {
        const buttons = {
            freeroam: css.FindEntityByName("btn_freeroam"),
            trials: css.FindEntityByName("btn_trials"),
            routes: css.FindEntityByName("btn_routes"),
            quit: css.FindEntityByName("btn_quit")
        };

        if (!buttons.freeroam || !buttons.trials || !buttons.routes || !buttons.quit) return;

        css.ConnectOutput(buttons.freeroam, "OnPressed", () =>
            this.switchMode("freeroam", this.destinations.freeroam)
        );

        css.ConnectOutput(buttons.trials, "OnPressed", () =>
            this.switchMode("trials", this.destinations.hub)
        );

        css.ConnectOutput(buttons.routes, "OnPressed", () =>
            this.switchMode("routes", this.destinations.hub)
        );

        css.ConnectOutput(buttons.quit, "OnPressed", () => {
            css.ServerCommand("spawn_group_unload movement_hub_script; kickid 0");
        });
    }
}

const server = new Server();
const player = new Player();

OnPlayerSpawn((data: PlayerSpawnEvent) => {
    if (data.userid !== player.userId) return;

    player.pawn?.Teleport({
        position: server.destinations.hub.pos,
        angles: server.destinations.hub.ang,
        velocity: Vec3.Zero
    });
    player.setMaxHealth();
    player.currentMode = "hub";

    for (let i = 0; i < 3; i++) {
        blips.print("{white}ⓘ {yellow}Welcome to Movement Hub V2!");
    }
});

OnServerCvar((data: ServerCvarEvent) => {
    server.handleCvarChange(data.cvarname);
});

OnPlayerHurt((data: PlayerHurtEvent) => {
    server.handlePlayerHurt(data);
});

css.OnPlayerJump((data: { player: CSPlayerPawn }) => {
    if (player.pawn === data.player) {
        player.onJump();
    }
});

css.OnScriptReload({
    after: () => {
        player.controller = css.GetPlayerController(0);
        player.pawn = player.controller?.GetPlayerPawn();

        css.EntFireAtName({name: "playerTrail", input: "kill"});
    }
});

css.OnScriptInput("kz_cp", () => {
    if (player.pawn) {
        player.setCheckpoint();
    }
});

css.OnScriptInput("kz_tp", () => {
    if (player.pawn) {
        player.tpCheckpoint();
    }
});

css.OnScriptInput("hub", () => {
    if (player.pawn) {
        server.switchMode("hub", server.destinations.hub);
    }
});

new ChatCommandHandler().setupCommands();

css.SetNextThink(css.GetGameTime() + nerdStuff.oneTick);
css.SetThink(() => server.think());
server.currentMapName = css.GetMapName();

css.Msg(`Movement Hub V2 script loaded for map ${server.currentMapName}`);