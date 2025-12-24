import { Instance, CSPlayerPawn, PointTemplate, CSPlayerController } from "cs_script/point_script";

const ZIPLINE_CONFIG = {
    MIN_DISTANCE_TO_ZIPLINE: 150,                           // minimum distance to start a zipline interaction while facing one of the interpolated points

    ENABLE_USE_KEY_INTERACTION: true,                       // If true, this will create a func_button on each of the interpolated zipline points.
                                                            // players can press +use to trigger ziplines.
                                                            // (warning: this can lower the fps of the players if you have a lot of ziplines in your map)

    REQUIRED_ITEM_FOR_USE: [],                              // Items allowed in hand for ENABLE_USE_KEY_INTERACTION (empty = no requirement)

    CAN_DROP_FROM_ZIPLINE: true,
    DISMOUNT_FORWARD_VELOCITY_MULTIPLIER: 5,
    DISMOUNT_UPWARD_VELOCITY: 400,

    SAG_MULTIPLIER: 1,
    DEFAULT_SAG_CURVE: 100,

    APPROACH_SPEED: 500,
    RIDING_SPEED: 550,
    APPROACH_THRESHOLD: 80,
    THINK_INTERVAL: 0.05,
    MAX_ZIPLINES_TO_SEARCH: 10,

    ZIP_HEIGHT_NORMAL: 75,
    ZIP_HEIGHT_VERTICAL: 16,
    VERTICAL_THRESHOLD_Z: 0.80,
    INITIAL_PLAYER_PUSH_UP: 16,

    MIN_START_END_PERCENTAGE: 0.05,
    PROXIMITY_OVERRIDE_THRESHOLD_PERCENTAGE: 0.10,
    FACING_ALIGNMENT_THRESHOLD: 0.5,
    MIN_FACING_DOT_PRODUCT: 0.3,

    DEBUG: false
};

//this is for when you dont want to use ENABLE_USE_KEY_INTERACTION and want to set up buttons manually
//youd call the script entity -> RunScriptInput -> ActivateZipline from the button or trigger entity
Instance.OnScriptInput("ActivateZipline", (context) => {
    if (context.activator instanceof CSPlayerPawn) {
        ziplineManager.activateZipline(context.activator);
    }
});

class Vector3 {
    static calculateDistance(v1, v2) {
        const dx = v2.x - v1.x;
        const dy = v2.y - v1.y;
        const dz = v2.z - v1.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    static normalize(v) {
        const magnitude = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
        if (magnitude === 0) return { x: 0, y: 0, z: 0 };
        return { x: v.x / magnitude, y: v.y / magnitude, z: v.z / magnitude };
    }

    static dotProduct(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }

    static qAngleToForwardVector(angles) {
        const DEG_TO_RAD = Math.PI / 180;
        const pitchRad = angles.pitch * DEG_TO_RAD;
        const yawRad = angles.yaw * DEG_TO_RAD;

        const cosYaw = Math.cos(yawRad);
        const sinYaw = Math.sin(yawRad);
        const cosPitch = Math.cos(pitchRad);
        const sinPitch = Math.sin(pitchRad);

        const x = cosYaw * cosPitch;
        const y = sinYaw * cosPitch;
        const z = -sinPitch;

        return { x, y, z };
    }
}

class Zipline {
    constructor(id, startEntity, endEntity) {
        this.id = id;
        this.start = startEntity;
        this.end = endEntity;
        this.ziplineLength = Vector3.calculateDistance(this.start.GetAbsOrigin(), this.end.GetAbsOrigin());

        this.curveValue = ZIPLINE_CONFIG.DEFAULT_SAG_CURVE;
        this.sagAmount = this.curveValue * ZIPLINE_CONFIG.SAG_MULTIPLIER;

        const startPos = this.start.GetAbsOrigin();
        const endPos = this.end.GetAbsOrigin();
        const movedir = {
            x: endPos.x - startPos.x,
            y: endPos.y - startPos.y,
            z: endPos.z - startPos.z
        };
        const magnitude = Math.sqrt(movedir.x * movedir.x + movedir.y * movedir.y + movedir.z * movedir.z);
        const normalizedMovedirZ = magnitude > 0 ? Math.abs(movedir.z) / magnitude : 0;
        this.isVertical = normalizedMovedirZ > ZIPLINE_CONFIG.VERTICAL_THRESHOLD_Z;

        if (ZIPLINE_CONFIG.ENABLE_USE_KEY_INTERACTION) {
            this.createZiplineButtons();
        }
    }

    createZiplineButtons() {
        Instance.EntFireAtName(`ziplineButton_${this.id}`, "Kill");
        const buttonTemplate = Instance.FindEntityByName("ziplineButtonTemplate");
        if (buttonTemplate instanceof PointTemplate) {
            const numPoints = 50;
            for (let i = 0; i <= numPoints; i++) {
                const t = i / numPoints;
                const pointOnCurve = this.getPointOnZipline(t);
                const buttonSpawnPos = {
                    x: pointOnCurve.x,
                    y: pointOnCurve.y,
                    z: pointOnCurve.z + 40
                };

                const [button] = buttonTemplate.ForceSpawn(buttonSpawnPos, { pitch: 0, yaw: 0, roll: 0 });
                Instance.ConnectOutput(button, `OnPressed`, (inputData) => {
                    if (!(inputData.activator instanceof CSPlayerPawn)) return;

                    const needsItem = ZIPLINE_CONFIG.REQUIRED_ITEM_FOR_USE.length > 0;
                    if (needsItem && !matchesWeapon(ZIPLINE_CONFIG.REQUIRED_ITEM_FOR_USE, inputData.activator.GetActiveWeapon()?.GetData().GetName())) return;
                    ziplineManager.activateZipline(inputData.activator);
                });
                button.SetEntityName(`ziplineButton_${this.id}_${i}`);
            }
            Instance.Msg(`spawned buttons for zipline ${this.id}`);
        }
    }

    getPointOnZipline(t) {
        const p0 = this.start.GetAbsOrigin();
        const p2 = this.end.GetAbsOrigin();

        const p1 = {
            x: (p0.x + p2.x) * 0.5,
            y: (p0.y + p2.y) * 0.5,
            z: (p0.z + p2.z) * 0.5 - this.sagAmount
        };

        const omt = (1 - t);
        const omt2 = omt * omt;
        const t2 = t * t;

        const x = omt2 * p0.x + 2 * omt * t * p1.x + t2 * p2.x;
        const y = omt2 * p0.y + 2 * omt * t * p1.y + t2 * p2.y;
        const z = omt2 * p0.z + 2 * omt * t * p1.z + t2 * p2.z;

        return { x, y, z };
    }

    getNearestPointAndT(playerPos) {
        let minDistanceSq = Infinity;
        let nearestPoint = null;
        let nearestT = 0;

        const px = playerPos.x;
        const py = playerPos.y;
        const pz = playerPos.z;

        const numSteps = 50;
        const stepSize = 1 / numSteps;
        for (let i = 0; i <= numSteps; i++) {
            const t = i * stepSize;
            const ziplinePoint = this.getPointOnZipline(t);
            const dx = px - ziplinePoint.x;
            const dy = py - ziplinePoint.y;
            const dz = pz - ziplinePoint.z;
            const distanceSq = dx * dx + dy * dy + dz * dz;

            if (distanceSq < minDistanceSq) {
                minDistanceSq = distanceSq;
                nearestPoint = ziplinePoint;
                nearestT = t;
            }
        }
        return { point: nearestPoint, t: nearestT, distance: Math.sqrt(minDistanceSq) };
    }
}

class ZiplinePlayerState {
    constructor(zipline, playerPawn, currentT, travelDirectionFactor, state, initialTargetPosForPlayerOrigin, heightOffset) {
        this.zipline = zipline;
        this.playerPawn = playerPawn;
        this.currentT = currentT;
        this.travelDirectionFactor = travelDirectionFactor;
        this.state = state;
        this.initialTargetPosForPlayerOrigin = initialTargetPosForPlayerOrigin;
        this.heightOffset = heightOffset;
    }
}

class ZiplineManager {
    constructor() {
        this.ziplines = [];
        this.activeZiplinePlayers = {};
    }

    init() {
        Instance.Msg("zipline init");
        this.ziplines = [];

        this.ziplines.length = 0;
        for (const key in this.activeZiplinePlayers) {
            delete this.activeZiplinePlayers[key];
        }

        for (let i = 1; i <= ZIPLINE_CONFIG.MAX_ZIPLINES_TO_SEARCH; i++) {
            const startName = `${i}_zipline_s`;
            const endName = `${i}_zipline_e`;

            const startEnt = Instance.FindEntityByName(startName);
            const endEnt = Instance.FindEntityByName(endName);

            if (startEnt && endEnt) {
                this.ziplines.push(new Zipline(i, startEnt, endEnt));
                Instance.Msg(`found zip ${i}: S (${startEnt.GetAbsOrigin().x.toFixed(2)}, ${startEnt.GetAbsOrigin().y.toFixed(2)}, ${startEnt.GetAbsOrigin().z.toFixed(2)}), E (${endEnt.GetAbsOrigin().x.toFixed(2)}, ${endEnt.GetAbsOrigin().y.toFixed(2)}, ${endEnt.GetAbsOrigin().z.toFixed(2)})`);
            } else {
                if (startEnt || endEnt || i === 1) {
                    Instance.Msg(`no zips found`);
                }
            }
        }

        if (this.ziplines.length !== 0) {
            Instance.SetNextThink(Instance.GetGameTime() + ZIPLINE_CONFIG.THINK_INTERVAL);
        }
    }

    dismountPlayerFromZipline(playerSlot, playerPawn, playerFeetPos, applyDismountVelocity = true) {
        if (!this.activeZiplinePlayers[playerSlot]) {
            return;
        }

        const ziplineState = this.activeZiplinePlayers[playerSlot];
        const ziplineId = ziplineState.zipline.id;

        Instance.Msg(`Player ${playerSlot} dismounting from zipline ${ziplineId}. Is vertical: ${ziplineState.zipline.isVertical}`);
        Instance.ServerCommand(
            `snd_sos_start_soundevent_at_pos UIPanorama.weapon_showSolo ${playerFeetPos.x} ${playerFeetPos.y} ${playerFeetPos.z}`
        );

        const currentVelo = playerPawn.GetAbsVelocity();
        let vx = currentVelo.x;
        let vy = currentVelo.y;
        let vz = currentVelo.z;

        if (applyDismountVelocity) {
            const horizontalSpeed = Math.sqrt(vx * vx + vy * vy);
            const maxSpeed = ziplineState.zipline.isVertical
                ? ZIPLINE_CONFIG.RIDING_SPEED / 4
                : ZIPLINE_CONFIG.RIDING_SPEED / 2;

            if (horizontalSpeed > maxSpeed) {
                const scale = maxSpeed / (horizontalSpeed);
                vx *= scale;
                vy *= scale;
            }

            if (ziplineState.zipline.isVertical) {
                const eyeAngles = playerPawn.GetEyeAngles();
                const dir = Vector3.normalize(Vector3.qAngleToForwardVector(eyeAngles));

                vx = dir.x * ZIPLINE_CONFIG.DISMOUNT_UPWARD_VELOCITY;
                vy = dir.y * ZIPLINE_CONFIG.DISMOUNT_UPWARD_VELOCITY;
                vz = dir.z * ZIPLINE_CONFIG.DISMOUNT_UPWARD_VELOCITY;
                Instance.Msg(`dir: ${dir.x}, ${dir.y}, ${dir.z}`);
            } else {
                vz = ZIPLINE_CONFIG.DISMOUNT_UPWARD_VELOCITY;
            }
        }

        const dismountVelocity = { x: vx, y: vy, z: vz };
        playerPawn.Teleport(null, null, dismountVelocity);

        delete this.activeZiplinePlayers[playerSlot];
    }

    playerHasLineOfSightToZipline(playerPawn, distance, ziplinePos) {
        const trace = Instance.GetTraceHit(
            playerPawn.GetEyePosition(),
            ziplinePos,
            { ignoreEnt: playerPawn, interacts: 0, sphereRadius: 5 }
        );

        /* Instance.DebugSphere(trace.end, 5, 60, { r: 255, g: 0, b: 0 });
        Instance.ServerCommand("say_team " + trace.hitEnt?.GetEntityName()); */

        if (trace.hitEnt?.GetEntityName().includes("ziplineButton_")) {
            return true;
        }

        return false;
    }

    activateZipline(playerPawn) {
        if (!(playerPawn instanceof CSPlayerPawn)) {
            return;
        }

        const playerController = playerPawn.GetPlayerController();
        if (!playerController || !playerController.IsValid()) {
            return;
        }

        const playerSlot = playerController.GetPlayerSlot();

        if (this.activeZiplinePlayers[playerSlot] && ZIPLINE_CONFIG.CAN_DROP_FROM_ZIPLINE) {
            const playerFeetPos = playerPawn.GetAbsOrigin();
            this.dismountPlayerFromZipline(playerSlot, playerPawn, playerFeetPos, true);
            return;
        }

        const playerFeetPos = playerPawn.GetAbsOrigin();
        const playerHeadPos = playerPawn.GetEyePosition();
        const playerAng = playerPawn.GetEyeAngles();
        const playerForward = Vector3.qAngleToForwardVector(playerAng);

        if (ZIPLINE_CONFIG.DEBUG) {
            Instance.DebugSphere(playerFeetPos, 10, ZIPLINE_CONFIG.THINK_INTERVAL * 2, { r: 255, g: 0, b: 0, a: 255 });
        }

        let closestZipline = null;
        let minDistanceToLine = Infinity;
        let initialT = 0;
        let initialPointOnLine = null;

        for (const zipline of this.ziplines) {
            const { point, t, distance } = zipline.getNearestPointAndT(playerHeadPos);
            if (distance < minDistanceToLine && distance < ZIPLINE_CONFIG.MIN_DISTANCE_TO_ZIPLINE) {
                minDistanceToLine = distance;
                closestZipline = zipline;
                initialT = t;
                initialPointOnLine = point;
            }
        }

        if (!closestZipline || (ZIPLINE_CONFIG.ENABLE_USE_KEY_INTERACTION && !this.playerHasLineOfSightToZipline(playerPawn, minDistanceToLine, initialPointOnLine))) {
            return;
        }

        const ziplineStartPos = closestZipline.start.GetAbsOrigin();
        const ziplineEndPos = closestZipline.end.GetAbsOrigin();

        const nearestPointOnZipline = closestZipline.getPointOnZipline(initialT);
        const toZipline = Vector3.normalize({
            x: nearestPointOnZipline.x - playerHeadPos.x,
            y: nearestPointOnZipline.y - playerHeadPos.y,
            z: nearestPointOnZipline.z - playerHeadPos.z
        });

        const facingZiplineDot = Vector3.dotProduct(playerForward, toZipline);

        if ((facingZiplineDot < ZIPLINE_CONFIG.MIN_FACING_DOT_PRODUCT) && ZIPLINE_CONFIG.ENABLE_USE_KEY_INTERACTION) {
            return;
        }

        const ziplineAxis = Vector3.normalize({
            x: ziplineEndPos.x - ziplineStartPos.x,
            y: ziplineEndPos.y - ziplineStartPos.y,
            z: ziplineEndPos.z - ziplineStartPos.z
        });

        let dotStartToEnd, dotEndToStart;

        if (closestZipline.isVertical) {
            dotStartToEnd = Vector3.dotProduct(playerForward, ziplineAxis);
            dotEndToStart = Vector3.dotProduct(playerForward, Vector3.normalize({
                x: -ziplineAxis.x,
                y: -ziplineAxis.y,
                z: -ziplineAxis.z
            }));
        } else {
            const playerForward2D = Vector3.normalize({ x: playerForward.x, y: playerForward.y, z: 0 });
            const ziplineAxis2D = Vector3.normalize({ x: ziplineAxis.x, y: ziplineAxis.y, z: 0 });

            dotStartToEnd = Vector3.dotProduct(playerForward2D, ziplineAxis2D);
            dotEndToStart = Vector3.dotProduct(playerForward2D, Vector3.normalize({
                x: -ziplineAxis2D.x,
                y: -ziplineAxis2D.y,
                z: 0
            }));
        }

        const strongForwardAlignment = dotStartToEnd > ZIPLINE_CONFIG.FACING_ALIGNMENT_THRESHOLD;
        const strongBackwardAlignment = dotEndToStart > ZIPLINE_CONFIG.FACING_ALIGNMENT_THRESHOLD;

        let travelDirectionFactor = 1;
        let startingT = initialT;

        if (strongForwardAlignment) {
            travelDirectionFactor = 1;
        } else if (strongBackwardAlignment) {
            travelDirectionFactor = -1;
        } else {
            travelDirectionFactor = initialT > 0.5 ? -1 : 1;
        }

        const proximityThreshold = ZIPLINE_CONFIG.PROXIMITY_OVERRIDE_THRESHOLD_PERCENTAGE;
        const minSafeT = ZIPLINE_CONFIG.MIN_START_END_PERCENTAGE;
        const maxSafeT = 1.0 - ZIPLINE_CONFIG.MIN_START_END_PERCENTAGE;

        if (initialT < proximityThreshold) {
            travelDirectionFactor = 1;
            startingT = minSafeT;
        } else if (initialT > (1.0 - proximityThreshold)) {
            travelDirectionFactor = -1;
            startingT = maxSafeT;
        }

        initialPointOnLine = closestZipline.getPointOnZipline(startingT);

        const heightOffset = closestZipline.isVertical ? ZIPLINE_CONFIG.ZIP_HEIGHT_VERTICAL : ZIPLINE_CONFIG.ZIP_HEIGHT_NORMAL;

        const initialTargetPosForPlayerOrigin = {
            x: initialPointOnLine.x,
            y: initialPointOnLine.y,
            z: initialPointOnLine.z - heightOffset
        };

        if (ZIPLINE_CONFIG.DEBUG) {
            Instance.DebugSphere(initialPointOnLine, 10, ZIPLINE_CONFIG.THINK_INTERVAL * 2, { r: 0, g: 255, b: 0, a: 255 });
            Instance.DebugSphere(initialTargetPosForPlayerOrigin, 10, ZIPLINE_CONFIG.THINK_INTERVAL * 2, { r: 255, g: 165, b: 0, a: 255 });
        }

        this.activeZiplinePlayers[playerSlot] = new ZiplinePlayerState(
            closestZipline,
            playerPawn,
            startingT,
            travelDirectionFactor,
            'approaching',
            initialTargetPosForPlayerOrigin,
            heightOffset
        );

        playerPawn.Teleport(
            { x: playerFeetPos.x, y: playerFeetPos.y, z: playerFeetPos.z + ZIPLINE_CONFIG.INITIAL_PLAYER_PUSH_UP },
            null,
            null
        );

        Instance.Msg(`Player ${playerSlot} activated zipline ${closestZipline.id}.`);

        Instance.ServerCommand(`snd_sos_start_soundevent_at_pos UIPanorama.tab_mainmenu_loadout ${playerFeetPos.x} ${playerFeetPos.y} ${playerFeetPos.z}`);
    }

    ziplineThink() {
        const gameTime = Instance.GetGameTime();
        const nextThinkTime = gameTime + ZIPLINE_CONFIG.THINK_INTERVAL;

        const playerSlotsToRemove = [];

        for (const playerSlotStr in this.activeZiplinePlayers) {
            const playerSlot = parseInt(playerSlotStr);
            const ziplineState = this.activeZiplinePlayers[playerSlotStr];
            const { zipline, playerPawn, state, initialTargetPosForPlayerOrigin, heightOffset, travelDirectionFactor } = ziplineState;

            if (!playerPawn || !playerPawn.IsValid()) {
                playerSlotsToRemove.push(playerSlotStr);
                continue;
            }

            const playerPos = playerPawn.GetAbsOrigin();

            if (state === 'approaching') {
                const dx = initialTargetPosForPlayerOrigin.x - playerPos.x;
                const dy = initialTargetPosForPlayerOrigin.y - playerPos.y;
                const dz = initialTargetPosForPlayerOrigin.z - playerPos.z;
                const distanceToTarget = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (distanceToTarget < ZIPLINE_CONFIG.APPROACH_THRESHOLD) {
                    ziplineState.state = 'riding';
                } else {
                    const invMagnitude = 1 / distanceToTarget;
                    const normalizedDirection = {
                        x: dx * invMagnitude,
                        y: dy * invMagnitude,
                        z: dz * invMagnitude
                    };

                    const speedMultiplier = ZIPLINE_CONFIG.APPROACH_SPEED * (distanceToTarget * 0.02);
                    const velocity = {
                        x: normalizedDirection.x * speedMultiplier,
                        y: normalizedDirection.y * speedMultiplier,
                        z: normalizedDirection.z * speedMultiplier
                    };
                    playerPawn.Teleport(null, null, velocity);
                }
            } else if (state === 'riding') {
                ziplineState.currentT += (ZIPLINE_CONFIG.RIDING_SPEED / zipline.ziplineLength) * ZIPLINE_CONFIG.THINK_INTERVAL * travelDirectionFactor;

                const reachedEnd = travelDirectionFactor === 1 && ziplineState.currentT >= 1.0;
                const reachedStart = travelDirectionFactor === -1 && ziplineState.currentT <= 0.0;

                if (reachedEnd || reachedStart || playerPawn.IsCrouched()) {
                    this.dismountPlayerFromZipline(playerSlot, playerPawn, playerPos, zipline.isVertical);
                } else {
                    const pointOnLine = zipline.getPointOnZipline(ziplineState.currentT);

                    const targetPosForPlayerOrigin = {
                        x: pointOnLine.x,
                        y: pointOnLine.y,
                        z: pointOnLine.z - heightOffset
                    };

                    const dx = targetPosForPlayerOrigin.x - playerPos.x;
                    const dy = targetPosForPlayerOrigin.y - playerPos.y;
                    const dz = targetPosForPlayerOrigin.z - playerPos.z;
                    const magnitude = Math.sqrt(dx * dx + dy * dy + dz * dz);

                    if (magnitude > 0) {
                        const invMagnitude = 1 / magnitude;
                        const velocity = {
                            x: dx * invMagnitude * ZIPLINE_CONFIG.RIDING_SPEED,
                            y: dy * invMagnitude * ZIPLINE_CONFIG.RIDING_SPEED,
                            z: dz * invMagnitude * ZIPLINE_CONFIG.RIDING_SPEED
                        };
                        playerPawn.Teleport(null, null, velocity);
                    }

                    if (ZIPLINE_CONFIG.DEBUG) {
                        Instance.DebugSphere(pointOnLine, 10, ZIPLINE_CONFIG.THINK_INTERVAL, { r: 0, g: 255, b: 0, a: 255 });
                        Instance.DebugSphere(targetPosForPlayerOrigin, 10, ZIPLINE_CONFIG.THINK_INTERVAL, { r: 255, g: 0, b: 0, a: 255 });
                    }
                }
            }
        }

        for (const slotStr of playerSlotsToRemove) {
            delete this.activeZiplinePlayers[slotStr];
        }

        Instance.SetNextThink(nextThinkTime);
    }
}

const ziplineManager = new ZiplineManager();
Instance.SetThink(() => ziplineManager.ziplineThink());

Instance.OnRoundStart(() => {
    ziplineManager.init();
});

Instance.OnReload(() => {
    ziplineManager.init();
});

function wildcardToRegex(pattern) {
    const escaped = pattern.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&');
    return new RegExp('^' + escaped.replace(/\*/g, '.*') + '$');
}

function matchesWeapon(allowed, weapon) {
    return allowed.some(pattern => {
        const regex = wildcardToRegex(pattern);
        return regex.test(weapon);
    });
}
