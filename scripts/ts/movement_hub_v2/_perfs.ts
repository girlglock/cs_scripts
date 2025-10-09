import { Instance, CSPlayerPawn } from "cs_script/point_script";

interface PlayerData {
    history: boolean[];
    lastLandSpeed: number | undefined;
    landTime: number | undefined;
    perf: string;
}

const playerData: Record<number, PlayerData> = {};

const TICK_INTERVAL: number = 1 / 64;
const MAX_GROUND_TICKS: number = 5;
const MAX_GROUND_TIME: number = MAX_GROUND_TICKS * TICK_INTERVAL;

function getHorizontalSpeed(pawn: CSPlayerPawn): number {
    const vel = pawn.GetAbsVelocity();
    return Math.sqrt(vel.x * vel.x + vel.y * vel.y);
}

Instance.OnPlayerLand((event: { player: CSPlayerPawn }) => {
    const pawn = event.player;
    const controller = pawn.GetPlayerController();
    if (!controller || !controller.IsConnected()) return;
    const slot = controller.GetPlayerSlot();
    if (!playerData[slot]) {
        playerData[slot] = { history: [], lastLandSpeed: undefined, landTime: undefined, perf: "0" };
    }
    const data = playerData[slot];
    data.lastLandSpeed = getHorizontalSpeed(pawn);
    data.landTime = Instance.GetGameTime();
});

Instance.OnPlayerJump((event: { player: CSPlayerPawn }) => {
    const pawn = event.player;
    const controller = pawn.GetPlayerController();
    if (!controller || !controller.IsConnected()) return;
    const slot = controller.GetPlayerSlot();
    const data = playerData[slot];
    if (!data || data.lastLandSpeed === undefined || data.landTime === undefined) return;
    const jumpTime = Instance.GetGameTime();
    const groundTime = jumpTime - data.landTime;
    if (groundTime > MAX_GROUND_TIME) return;
    const currentSpeed = getHorizontalSpeed(pawn);
    const isPerfect = currentSpeed >= data.lastLandSpeed;
    data.history.push(isPerfect);
    if (data.history.length > 1000) {
        data.history.shift();
    }
    const perfectCount = data.history.filter(p => p).length;
    const totalJumps = data.history.length;
    data.perf = totalJumps > 0 ? (perfectCount / totalJumps * 100).toFixed(1) : "0";
});

Instance.OnPlayerDisconnect((event: { playerSlot: number }) => {
    const slot = event.playerSlot;
    delete playerData[slot];
});

Instance.OnRoundStart(() => {

    Object.keys(playerData).forEach(slot => delete playerData[Number(slot)]);
});

const updateDisplay = (): void => {
    let y = 800;
    for (let slot = 0; slot < 64; slot++) {
        const ctrl = Instance.GetPlayerController(slot);
        if (ctrl && ctrl.IsConnected()) {
            const name = ctrl.GetPlayerName();
            const data = playerData[slot];
            if (data && data.history.length > 0) {
                const totalJumps = data.history.length;
                const perf = data.perf;
                let text = `${name}: ${totalJumps}/1000: ${perf}% perf`;
                Instance.DebugScreenText({
                    text,
                    x: 800,
                    y,
                    duration: TICK_INTERVAL,
                    color: { r: 255, g: 255, b: 255 }
                });
                y += 10;
            }
        }
    }
    Instance.SetNextThink(Instance.GetGameTime() + TICK_INTERVAL);
};

Instance.SetThink(updateDisplay);
Instance.SetNextThink(Instance.GetGameTime() + TICK_INTERVAL); 