import { Vec3, Euler } from "@s2ze/math";

export type GameMode = "freeroam" | "trials" | "routes" | "hub";

export interface Checkpoint {
    pos: Vec3;
    ang: Euler;
    beforeTp: {
        pos: Vec3;
        ang: Euler;
        wasInAir: boolean;
    };
    justTeleported: boolean;
}

export interface GroundState {
    onGround: boolean;
    pos: Vec3;
    ang: Euler;
    vel: Vec3;
}

export interface TrialData {
    currentStage: number;
    timer: {
        running: boolean;
        ticks: number;
        fails: number;
    };
    pb: {
        time: number;
        fails: number;
    };
}