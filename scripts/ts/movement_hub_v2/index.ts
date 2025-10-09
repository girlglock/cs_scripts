import { CSPlayerController, CSPlayerPawn, Instance as css, Entity, PointTemplate, Vector, Color, Instance } from "cs_script/point_script";
import { Vec3, Euler, Vector3Utils } from "@s2ze/math";
import { RegisterAllEventListeners, OnPlayerSpawn, OnServerCvar, OnPlayerHurt } from '../.ext/eventlisteners/eventlisteners';
import { blips } from "../.ext/blips/blips";
import { HitGroup } from "../.ext/enums/hitgroups";

import { Checkpoint, TrialData, GameMode, GroundState } from "./stuff/types";
import { mapConfigs, MapName, config, nerdStuff } from "./stuff/configs";
import { Utils } from "./stuff/utils";



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
    };

    pawn: CSPlayerPawn | undefined = undefined;
    controller: CSPlayerController | undefined = undefined;
    userId: number = 0;
    currentMode: GameMode = "freeroam";

    kz = {
        checkpoints: {
            pos: Vec3.Zero,
            ang: Euler.Zero,
            beforeTp: { pos: Vec3.Zero, ang: Euler.Zero, wasInAir: false },
            justTeleported: false,
        } as Checkpoint,
        lastOnGround: {
            onGround: true,
            pos: Vec3.Zero,
            ang: Euler.Zero,
            vel: Vec3.Zero,
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
        const distanceToCheckpoint = Vector3Utils.distance(this.kz.checkpoints.pos, pos);
        const isAtCheckpoint = distanceToCheckpoint < config.CHECKPOINT_DISTANCE_THRESHOLD;

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

        this.kz.checkpoints.beforeTp = { pos, ang, wasInAir: !this.kz.lastOnGround.onGround };
        this.kz.checkpoints.justTeleported = true;
        this.kz.lastOnGround.onGround = true;

        this.teleportTo(this.kz.checkpoints.pos, this.kz.checkpoints.ang);
        blips.print("{white}ⓘ {yellow}Teleporting to last checkpoint...");
    }

    private teleportTo(position: Vec3, angles: Euler): void {
        this.pawn?.Teleport({ position, angles, velocity: Vec3.Zero });
    }

    updateMovementStuff(): void {
        if (!this.pawn) return;

        const isOnGround = this.pawn.GetGroundEntity() !== undefined;
        const velo = this.pawn.GetAbsVelocity() as Vec3;
        const pos = this.pawn.GetAbsOrigin() as Vec3;
        const ang = this.pawn.GetEyeAngles() as Euler;

        this.handleLandingJump(isOnGround, pos);
        this.updateGroundState(isOnGround, pos, ang, velo);
    }

    private handleLandingJump(isOnGround: boolean, pos: Vec3): void {
        if (this.kz.lastOnGround.onGround || !isOnGround || this.kz.checkpoints.justTeleported) {
            return;
        }

        const heightDiff = Math.abs(this.kz.lastOnGround.pos.z - pos.z);
        if (heightDiff >= config.HEIGHT_THRESHOLD) return;

        const distance = Vector3Utils.distance2D(this.kz.lastOnGround.pos, pos) + config.DISTANCE_OFFSET;
        const color = Utils.getJSColor(distance);

        if (color !== "invalid") {
            const preSpeed = Vector3Utils.length2D(this.kz.lastOnGround.vel).toFixed(2);
            blips.print(
                `{blue}= ( • . • ) = {white}Distance: {${color}}${distance.toFixed(2)}{white}u | Pre: {green}${preSpeed}{white}u`,
                pos,
                config.sounds.ticker
            );
        }
    }

    private updateGroundState(isOnGround: boolean, pos: Vec3, ang: Euler, velo: Vec3): void {
        this.kz.lastVelo = this.kz.velo;
        this.kz.velo = velo;
        this.kz.lastOnGround.onGround = isOnGround;

        if (this.kz.checkpoints.justTeleported) {
            this.kz.checkpoints.justTeleported = false;
        }

        if (isOnGround) {
            this.kz.lastOnGround.pos = pos;
            this.kz.lastOnGround.ang = ang;
            this.kz.lastOnGround.vel = velo;
        }
    }

    updateVeloHUD(): void {
        const velo2D = Vector3Utils.length2D(this.kz.velo).toFixed(2);
        const lastVelo2D = Vector3Utils.length2D(this.kz.lastVelo).toFixed(2);
        const color = this.getVelocityColor(parseFloat(velo2D), parseFloat(lastVelo2D));

        this.renderVelocityText(velo2D, 50, color);
        this.renderPreVelocityText(60, color);
    }

    private getVelocityColor(current: number, last: number): Color {
        if (current > last) return { r: 150, g: 150, b: 255, a: 255 };
        if (current < last) return { r: 255, g: 150, b: 150, a: 255 };
        return { r: 255, g: 255, b: 255, a: 255 };
    }

    private renderVelocityText(velocity: string, yOffset: number, color: Color): void {
        const text = velocity.padStart(6, "0");
        css.DebugScreenText({
            text,
            x: (1920 / 2) - Utils.getStringCenterOffset(text),
            y: (1080 / 2) + yOffset,
            duration: nerdStuff.oneTick,
            color
        });
    }

    private renderPreVelocityText(yOffset: number, color: Color): void {
        const preVelo = !this.kz.lastOnGround.onGround
            ? Vector3Utils.length2D(this.kz.lastOnGround.vel).toFixed(2).padStart(6, "0")
            : "---. --";
        const text = `(${preVelo})`;

        css.DebugScreenText({
            text,
            x: (1920 / 2) - Utils.getStringCenterOffset(text),
            y: (1080 / 2) + yOffset,
            duration: nerdStuff.oneTick,
            color
        });
    }

    setMaxHealth(): void {
        this.pawn?.SetMaxHealth(nerdStuff.maxInt);
        this.pawn?.SetHealth(nerdStuff.maxInt);
    }

    onJump(): void {
        if (!this.pawn) return;
        this.kz.lastOnGround.vel = this.pawn.GetAbsVelocity() as Vec3;
        if (this.kz.lastOnGround.onGround) {
            this.kz.lastOnGround.onGround = false;
        }
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
        steamHappyTemplate: undefined as Entity | undefined,
        hubSpawn: undefined as Vector | undefined,
        freeroamSpawn: undefined as Vector | undefined,
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

    private initialize(): void {
        RegisterAllEventListeners();
        this.findEntities();

        player.setMaxHealth();
        player.pawn?.Teleport({
            position: this.entities.hubSpawn,
            angles: Euler.Zero,
            velocity: Vec3.Zero
        });
        player.currentMode = "hub";
        this.initDone = true;

        this.printWelcomeMessage();
    }

    private updateGame(): void {
        const gameTime = css.GetGameTime();

        this.updateRadio(gameTime);
        blips.update(gameTime);
        player.updateMovementStuff();
        player.updateVeloHUD();
        this.renderDebugInfo();
    }

    private printWelcomeMessage(): void {
        for (let i = 0; i < 3; i++) {
            blips.print("{white}ⓘ {yellow}Welcome to Movement Hub V2!");
        }
    }

    private renderDebugInfo(): void {
        css.DebugScreenText({
            text: `Movement Hub V2 | Map: ${this.currentMapName} | Mode: ${player.currentMode} | OnGround: ${player.kz.lastOnGround.onGround}`,
            x: 10,
            y: 10,
            duration: nerdStuff.oneTick,
            color: { r: 255, g: 255, b: 255, a: 255 }
        });
    }

    findEntities(): void {
        this.findPlayerEntities();
        this.findMapEntities();
        this.setupButtons();
    }

    private findPlayerEntities(): void {
        player.controller = css.GetPlayerController(0);
        player.pawn = player.controller?.GetPlayerPawn();
    }

    private findMapEntities(): void {
        const currentMapConfig = mapConfigs[this.currentMapName as MapName];
        this.entities.freeroamSpawn = currentMapConfig.freeroamSpawn.pos;

        const steamHappyTemplate = css.FindEntityByName("templateSteamHappy");
        const hubSpawn = css.FindEntityByName("tp_hub");

        if (hubSpawn && steamHappyTemplate) {
            this.entities.hubSpawn = hubSpawn.GetAbsOrigin();
            this.entities.steamHappyTemplate = steamHappyTemplate;
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
            this.switchMode("freeroam", this.entities.freeroamSpawn, "Free Roam")
        );

        css.ConnectOutput(buttons.trials, "OnPressed", () =>
            this.switchMode("trials", this.entities.hubSpawn, "Trials")
        );

        css.ConnectOutput(buttons.routes, "OnPressed", () =>
            this.switchMode("routes", this.entities.hubSpawn, "Routes")
        );

        css.ConnectOutput(buttons.quit, "OnPressed", () => {
            css.ServerCommand("spawn_group_unload movement_hub_script; kickid 0");
        });
    }

    private switchMode(mode: GameMode, position: Vector | undefined, displayName: string): void {
        if (!player.pawn || !position) return;

        player.pawn.Teleport({ position, velocity: Vec3.Zero });
        player.currentMode = mode;
        blips.print(`{white}ⓘ {yellow}Entering ${displayName} mode...`);
    }

    updateRadio(gameTime: number): void {
        const currentSecond = Math.floor(gameTime);
        if (currentSecond === this.lastRadioSecond) return;

        this.lastRadioSecond = currentSecond;
        const isEvenSecond = currentSecond % 2 === 0;

        if (player.currentMode === "freeroam") {
            css.ServerCommand(isEvenSecond ? "radio" : "radio1");
        } else if (player.currentMode === "trials" || player.currentMode === "routes") {
            css.ServerCommand(isEvenSecond ? "radio2" : "radio3");
        }
    }

    sendChat(text: string): void {
        css.ServerCommand("say_team " + text);
        this.playSound(config.sounds.ticker);
    }

    playSound(soundName: string): void {
        const pos = player.pawn?.GetAbsOrigin() || Vec3.Zero;
        css.ServerCommand(`snd_sos_start_soundevent_at_pos ${soundName} ${pos.x} ${pos.y} ${pos.z}`);
    }

    handleCvarChange(cvarname: string): void {
        if (config.BANNED_CVARS.has(cvarname)) {
            css.ServerCommand(`kickid 0`);
        }
    }

    handlePlayerHurt(data: any): void {
        const attackerName = css.GetPlayerController(data.attacker)?.GetPlayerName();
        const victimName = css.GetPlayerController(data.userid)?.GetPlayerName();
        const limb = HitGroup[data.hitgroup];

        const msg = `{red}${attackerName}{white} {red}[${data.weapon}]{white} {blue}${victimName}{white} (${limb}) | {yellow}DMG - HP:${data.dmg_health} A:${data.dmg_armor}{white} | {green}LEFT - HP:${data.health} A:${data.armor}`
            .trim()
            .replace(/\s+/g, ' ');

        css.Msg(msg);
        blips.print(msg);
    }
}

const server = new Server();
const player = new Player();

OnPlayerSpawn((data) => {
    if (data.userid !== player.userId) return;

    player.pawn?.Teleport({
        position: server.entities.hubSpawn ?? undefined,
        angles: Euler.Zero,
        velocity: Vec3.Zero
    });
    player.setMaxHealth();
    player.currentMode = "hub";

    for (let i = 0; i < 3; i++) {
        blips.print("{white}ⓘ {yellow}Welcome to Movement Hub V2!");
    }
});

OnServerCvar((data) => {
    server.handleCvarChange(data.cvarname);
});

OnPlayerHurt((data) => {
    server.handlePlayerHurt(data);
});

css.OnPlayerJump((data) => {
    if (player.pawn === data.player) {
        player.onJump();
    }
});

css.OnScriptReload({
    after: () => {
        player.controller = css.GetPlayerController(0);
        player.pawn = player.controller?.GetPlayerPawn();
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

css.OnPlayerChat((data) => {
    if (data.player === player.controller) {
        switch (data.text) {
            case "!perfs":
                break;
            default:
                break;
        }
    }
});

css.SetNextThink(css.GetGameTime() + nerdStuff.oneTick);
css.SetThink(() => server.think());
server.currentMapName = css.GetMapName();

css.Msg(`Movement Hub V2 script loaded for map ${server.currentMapName}`);