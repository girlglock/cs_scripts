import { Instance, PointTemplate, CSPlayerController, CSPlayerPawn } from "cs_script/point_script";

/* TODO:    add scoring
            add sounds
            add particle effects
            handle player death
*/

const QUAKE_PHYSICS = {
    ROCKET_SPEED: 1000 / 2, //half for cs
    ROCKET_LIFETIME: 5.0,
    ROCKET_RADIUS: 3,
    EXPLOSION_RADIUS: 120,
    EXPLOSION_DAMAGE_MAX: 100,
    EXPLOSION_KNOCKBACK: 1000 / 2,
    PLAYER_MINS: { x: -16, y: -16, z: -24 },
    PLAYER_MAXS: { x: 16, y: 16, z: 32 },
    THINK_INTERVAL: 1 / 64,
};

class QuakeRocket {
    constructor(owner, startPos, direction, initialVelocity = null) {
        this.owner = owner;
        this.position = startPos;
        this.prevPosition = startPos;
        this.direction = Vector.normalize(direction);
        this.velocity = Vector.scale(this.direction, QUAKE_PHYSICS.ROCKET_SPEED);
        if (initialVelocity) {
            const playerVel = initialVelocity;
            this.velocity = Vector.add(this.velocity, Vector.scale(playerVel, 0.2));
        }
        this.spawnTime = Instance.GetGameTime();
        this.entity = null;
        this.alive = true;
    }

    update(deltaTime) {
        if (!this.alive || !this.entity || !this.entity.IsValid()) {
            return false;
        }
        const currentTime = Instance.GetGameTime();
        if (currentTime - this.spawnTime > QUAKE_PHYSICS.ROCKET_LIFETIME) {
            this.remove();
            return false;
        }
        this.prevPosition = this.position;
        this.position = Vector.add(this.position, Vector.scale(this.velocity, deltaTime));
        this.entity.Teleport(
            this.position,
            null,
            this.velocity
        );
        return true;
    }

    checkCollision(collisionSystem) {
        if (!this.alive) return false;
        const traceOpts = {
            ignoreEnt: this.owner,
            sphereRadius: QUAKE_PHYSICS.ROCKET_RADIUS,
            interacts: 0
        };
        const traceResult = Instance.GetTraceHit(
            this.prevPosition,
            this.position,
            traceOpts
        );
        const playerHit = collisionSystem.checkPlayerCollision(this);
        if (traceResult.didHit || playerHit) {
            let hitPos = this.position;
            if (traceResult.didHit && traceResult.end) {
                hitPos = traceResult.end;
            }
            this.explode(hitPos);
            return true;
        }
        return false;
    }

    explode(position) {
        if (!this.alive) return;
        this.alive = false;
        const explodeTemplate = Instance.FindEntityByName("explodeTemplate");
        if (explodeTemplate instanceof PointTemplate) {
            explodeTemplate.ForceSpawn(position);
        }
        this.applyExplosionDamage(position);
    }

    applyExplosionDamage(explosionPos) {
        const players = Instance.FindEntitiesByClass("player");
        for (const player of players) {
            if (!(player instanceof CSPlayerPawn) || !player.IsValid() || player.GetHealth() <= 0) {
                continue;
            }
            const playerPos = player.GetAbsOrigin();
            const distance = Vector.distance(playerPos, explosionPos);
            if (distance > QUAKE_PHYSICS.EXPLOSION_RADIUS) continue;
            const damageFactor = Math.max(0, (QUAKE_PHYSICS.EXPLOSION_RADIUS - distance) / QUAKE_PHYSICS.EXPLOSION_RADIUS);
            const rawDamage = QUAKE_PHYSICS.EXPLOSION_DAMAGE_MAX * damageFactor;
            if (rawDamage > 0) {
                const currentArmor = player.GetArmor();
                let actualDamage = rawDamage;
                let armorDamage = 0;
                if (currentArmor > 0) {
                    const armorAbsorption = 0.667;
                    const armorWearRate = 0.333;
                    const absorbedDamage = rawDamage * armorAbsorption;
                    armorDamage = absorbedDamage * armorWearRate;
                    actualDamage = rawDamage - absorbedDamage;
                    armorDamage = Math.min(armorDamage, currentArmor);
                    const newArmor = Math.max(0, currentArmor - armorDamage);
                    player.SetArmor(newArmor);
                }
                const newHealth = Math.max(0, player.GetHealth() - actualDamage);
                if (newHealth > 0) {
                    player.SetHealth(newHealth);
                }
                else {
                    player.Kill();
                }
            }
            if (distance > 0) {
                const knockbackDir = Vector.normalize(Vector.sub(playerPos, explosionPos));
                const knockbackForce = QUAKE_PHYSICS.EXPLOSION_KNOCKBACK * damageFactor;
                const knockback = Vector.scale(knockbackDir, knockbackForce);
                const currentVel = player.GetAbsVelocity();
                const newVel = Vector.add(currentVel, knockback);
                player.Teleport(null, null, newVel);
            }
        }
    }

    remove() {
        this.alive = false;
        if (this.entity && this.entity.IsValid()) {
            this.entity.Remove();
        }
    }
}

class CollisionSystem {
    checkPlayerCollision(rocket) {
        const players = Instance.FindEntitiesByClass("player");
        for (const player of players) {
            if (!player || !player.IsValid() || player.GetHealth() <= 0 || player === rocket.owner) {
                continue;
            }
            if (this.rayTraceIntoPlayerBbox(rocket.prevPosition, rocket.position, player)) {
                return player;
            }
        }
        return null;
    }

    rayTraceIntoPlayerBbox(start, end, player) {
        const playerPos = player.GetAbsOrigin();
        const mins = Vector.add(playerPos, QUAKE_PHYSICS.PLAYER_MINS);
        const maxs = Vector.add(playerPos, QUAKE_PHYSICS.PLAYER_MAXS);
        return this.rayTraceBboxIntersection(start, end, mins, maxs);
    }

    rayTraceBboxIntersection(start, end, boxMin, boxMax) {
        const dir = Vector.sub(end, start);
        const length = Vector.length3D(dir);
        if (length === 0) return false;
        const normalizedDir = Vector.normalize(dir);
        let tMin = 0;
        let tMax = length;
        for (const axis of ['x', 'y', 'z']) {
            const origin = start[axis];
            const direction = normalizedDir[axis];
            if (Math.abs(direction) < 0.0001) {
                if (origin < boxMin[axis] || origin > boxMax[axis]) {
                    return false;
                }
            } else {
                const t1 = (boxMin[axis] - origin) / direction;
                const t2 = (boxMax[axis] - origin) / direction;
                const tNear = Math.min(t1, t2);
                const tFar = Math.max(t1, t2);
                tMin = Math.max(tMin, tNear);
                tMax = Math.min(tMax, tFar);
                if (tMin > tMax) return false;
            }
        }
        return tMin <= length && tMax >= 0;
    }
}

class RocketLauncher {
    constructor() {
        this.rockets = [];
        this.collisionSystem = new CollisionSystem();
        this.lastThinkTime = Instance.GetGameTime();
    }

    fireRocket(player) {
        if (!player || !player.IsValid()) return;
        const rocketTemplate = Instance.FindEntityByName("rocket_template");
        if (!(rocketTemplate instanceof PointTemplate)) return;
        const eyePos = player.GetEyePosition();
        const eyeAngles = player.GetEyeAngles();
        const playerVel = player.GetAbsVelocity();
        const direction = this.angleToDirection(eyeAngles);
        const spawnPos = Vector.add(eyePos, Vector.scale(direction, 24));
        
        const rocket = new QuakeRocket( player,
                                        spawnPos,
                                        direction,
                                        playerVel);
        
        const spawnedEnts = rocketTemplate.ForceSpawn(spawnPos, eyeAngles);
        if (!spawnedEnts || spawnedEnts.length === 0) return;
        this.rockets.push(rocket);
    }

    angleToDirection(angles) {
        const yawRad = (angles.yaw * Math.PI) / 180;
        const pitchRad = (angles.pitch * Math.PI) / 180;
        return Vector.create(
            Math.cos(yawRad) * Math.cos(pitchRad),
            Math.sin(yawRad) * Math.cos(pitchRad),
            -Math.sin(pitchRad)
        );
    }

    update() {
        const currentTime = Instance.GetGameTime();
        const deltaTime = currentTime - this.lastThinkTime;
        this.lastThinkTime = currentTime;
        const activeRockets = [];
        for (const rocket of this.rockets) {
            const stillAlive = rocket.update(deltaTime);
            if (stillAlive) {
                const collided = rocket.checkCollision(this.collisionSystem);
                if (!collided && rocket.alive) {
                    activeRockets.push(rocket);
                }
            }
        }
        this.rockets = activeRockets;
        Instance.SetNextThink(QUAKE_PHYSICS.THINK_INTERVAL);
    }

    clearAllRockets() {
        for (const rocket of this.rockets) {
            rocket.remove();
        }
        this.rockets = [];
    }
}

const rocketLauncher = new RocketLauncher();

Instance.OnGunFire((weapon) => {
    if (weapon && weapon.GetData().GetName() === "weapon_taser") {
        const playerPawn = weapon.GetOwner();
        if (playerPawn) {
            rocketLauncher.fireRocket(playerPawn);
        }
    }
});

Instance.OnRoundStart(() => {
    rocketLauncher.clearAllRockets();
});

Instance.OnActivate(() => {
    Instance.SetNextThink(QUAKE_PHYSICS.THINK_INTERVAL);
});

Instance.OnReload(() => {
    rocketLauncher.clearAllRockets();
    Instance.SetNextThink(QUAKE_PHYSICS.THINK_INTERVAL);
});

Instance.SetThink(rocketLauncher.update);
Instance.SetNextThink(QUAKE_PHYSICS.THINK_INTERVAL);
Instance.Msg("q1 rl loaded...");

class Vector {
    static nullV = { x: 16000, y: 16000, z: 16000 };
    static zeroV = { x: 0, y: 0, z: 0 };

    static create(x = 0, y = 0, z = 0) {
        return { x, y, z };
    }

    static add(a, b) {
        return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
    }

    static sub(a, b) {
        return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
    }

    static scale(v, s) {
        return { x: v.x * s, y: v.y * s, z: v.z * s };
    }

    static dot(a, b) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }

    static cross(a, b) {
        return {
            x: a.y * b.z - a.z * b.y,
            y: a.z * b.x - a.x * b.z,
            z: a.x * b.y - a.y * b.x
        };
    }

    static length3D(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    }

    static normalize(v) {
        const len = this.length3D(v);
        return len === 0 ? this.zeroV : this.scale(v, 1 / len);
    }

    static distance(a, b) {
        return this.length3D(this.sub(a, b));
    }

    static equals(a, b) {
        return a.x === b.x && a.y === b.y && a.z === b.z;
    }
}

class QAngle {
    static zero = { pitch: 0, yaw: 0, roll: 0 };

    static create(pitch = 0, yaw = 0, roll = 0) {
        return { pitch, yaw, roll };
    }

    static clone(a) {
        return { pitch: a.pitch, yaw: a.yaw, roll: a.roll };
    }

    static add(a, b) {
        return { pitch: a.pitch + b.pitch, yaw: a.yaw + b.yaw, roll: a.roll + b.roll };
    }

    static sub(a, b) {
        return { pitch: a.pitch - b.pitch, yaw: a.yaw - b.yaw, roll: a.roll - b.roll };
    }

    static scale(a, s) {
        return { pitch: a.pitch * s, yaw: a.yaw * s, roll: a.roll * s };
    }

    static normalize(a) {
        return {
            pitch: this._normalizeAngle(a.pitch),
            yaw: this._normalizeAngle(a.yaw),
            roll: this._normalizeAngle(a.roll)
        };
    }

    static equals(a, b) {
        return a.pitch === b.pitch && a.yaw === b.yaw && a.roll === b.roll;
    }

    static _normalizeAngle(angle) {
        let a = angle % 360;
        if (a >= 180) a -= 360;
        if (a < -180) a += 360;
        return a;
    }
}
