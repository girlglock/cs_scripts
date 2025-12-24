import {Euler, Vec3} from "@s2ze/math";

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
    frames: number;
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
    clipBlocks: clipBlock[];
    resetBlocks: resetBlock[];
}

export interface clipBlock {
    pos: Vec3;
    ang: Euler;
    scale: number;
}

export interface resetBlock {
    pos: Vec3;
    ang: Euler;
    scale: number;
    callback: () => void;
    type: "red" | "blue";
}

export interface Destination {
    name?: string;
    pos: Vec3;
    ang: Euler;
}