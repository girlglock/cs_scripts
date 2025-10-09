import { Vec3, Euler } from "@s2ze/math";

export const config = {
    debug: false,
    sounds: {
        levelDown: "UI.ArmsRace.Demoted",
        levelUp: "UI.XP.LevelUp",
        beepSound: "Buttons.snd9",
        errorSound: "Buttons.snd8",
        yippi2: "UI.CoinLevelUp",
        yippi: "psp1g.yippie",
        laugh: "fire2k.laugh",
        requestMove: " swat_fem.request_move_",
        ticker: "UIPanorama.XP.Ticker"
    },
    BANNED_CVARS: new Set([
        "sv_airaccelerate",
        "sv_jump_spam_penalty_time",
        "sv_staminajumpcost",
        "sv_staminalandcost",
        "sv_air_max_wishspeed",
        "sv_enablebunnyhopping",
        "sv_accelerate",
        "sv_autobunnyhopping"
    ]),

    CHECKPOINT_DISTANCE_THRESHOLD: 100,
    HEIGHT_THRESHOLD: 72,
    DISTANCE_OFFSET: 16
};

export const nerdStuff = {
    pi: 3.14159265,
    doublePi: 6.2831853,
    halfPi: 1.5707963,
    rad: 0.0174533,
    deg: 57.2957795,
    maxInt: 2147483647,
    oneTick: 0.015625,
    nl: "\u2029"
};

export type MapName = "de_nuke" | "de_mirage" | "de_dust2" | "de_inferno" | "de_vertigo";

export const mapConfigs: Record<MapName, { freeroamSpawn: { pos: Vec3; ang: Euler } }> = {
    de_nuke: {
        freeroamSpawn: { pos: new Vec3(104.768997, -1663.896484, 45.031250), ang: new Euler(12.847964, -4.257110, 0) },
    },
    de_mirage: {
        freeroamSpawn: { pos: new Vec3(0, 0, 0), ang: new Euler(0, 0, 0) },
    },
    de_dust2: {
        freeroamSpawn: { pos: new Vec3(0, 0, 0), ang: new Euler(0, 0, 0) },
    },
    de_inferno: {
        freeroamSpawn: { pos: new Vec3(0, 0, 0), ang: new Euler(0, 0, 0) },
    },
    de_vertigo: {
        freeroamSpawn: { pos: new Vec3(0, 0, 0), ang: new Euler(0, 0, 0) },
    }
};