import { Instance, CSPlayerPawn } from "cs_script/point_script";

const CONFIG = {
    JUMP_PAD_PUSH_VELOCITY: 500,
    JUMP_PAD_HORIZONTAL_MULTIPLIER: 0.8,
    JUMP_PAD_VERTICAL_MULTIPLIER: 1.0,
    JUMP_PAD_CENTER_RADIUS: 32,
    JUMP_PAD_LOW_VELOCITY_THRESHOLD: 150,
    JUMP_PAD_HIGH_VELOCITY_THRESHOLD: 100
}

Instance.OnScriptInput("onJumpPad", (context) => {
    if (!(context.activator instanceof CSPlayerPawn)) {
        return;
    }
    
    const player = context.activator;
    const jumpPad = context.caller;
    
    if (!player.IsValid() || player.GetHealth() <= 0) {
        return;
    }
    
    if (!jumpPad || !jumpPad.IsValid()) {
        return;
    }
    
    const jumpPadOrigin = jumpPad.GetAbsOrigin();
    const playerOrigin = player.GetAbsOrigin();
    const currentVelocity = player.GetAbsVelocity();
    
    const horizontalSpeed = Math.sqrt(currentVelocity.x * currentVelocity.x + currentVelocity.y * currentVelocity.y);
    
    const padToPlayer = {
        x: playerOrigin.x - jumpPadOrigin.x,
        y: playerOrigin.y - jumpPadOrigin.y,
        z: 0
    };
    const distanceFromCenter = Math.sqrt(padToPlayer.x * padToPlayer.x + padToPlayer.y * padToPlayer.y);
    
    let directionVector;
    
    if (distanceFromCenter <= CONFIG.JUMP_PAD_CENTER_RADIUS && horizontalSpeed < CONFIG.JUMP_PAD_LOW_VELOCITY_THRESHOLD) {
        directionVector = {
            x: 0,
            y: 0,
            z: 0
        };
    } else if (horizontalSpeed > CONFIG.JUMP_PAD_HIGH_VELOCITY_THRESHOLD) {
        directionVector = {
            x: currentVelocity.x / horizontalSpeed,
            y: currentVelocity.y / horizontalSpeed,
            z: 0
        };
    } else {
        if (distanceFromCenter > 5) {
            directionVector = {
                x: padToPlayer.x / distanceFromCenter,
                y: padToPlayer.y / distanceFromCenter,
                z: 0
            };
        } else {
            directionVector = {
                x: 0,
                y: 0,
                z: 0
            };
        }
    }
    
    const launchVelocity = {
        x: directionVector.x * CONFIG.JUMP_PAD_PUSH_VELOCITY * CONFIG.JUMP_PAD_HORIZONTAL_MULTIPLIER,
        y: directionVector.y * CONFIG.JUMP_PAD_PUSH_VELOCITY * CONFIG.JUMP_PAD_HORIZONTAL_MULTIPLIER,
        z: CONFIG.JUMP_PAD_PUSH_VELOCITY * CONFIG.JUMP_PAD_VERTICAL_MULTIPLIER
    };
    
    const finalVelocity = {
        x: currentVelocity.x + launchVelocity.x,
        y: currentVelocity.y + launchVelocity.y,
        z: Math.max(currentVelocity.z, 0) + launchVelocity.z
    };
    
    player.Teleport(null, null, finalVelocity);
});
