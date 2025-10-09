import { Instance as css } from "cs_script/point_script";
import { RegisterAllEventListeners, OnServerCvar, OnPlayerHurt } from "./_ext/eventlisteners/eventlisteners";
import { blips } from "./_ext/blips/blips";
import { HitGroup } from "./_ext/enums/hitgroups";

css.OnActivate(() => {
    RegisterAllEventListeners();
});

css.OnScriptReload({
    after: () => {
        RegisterAllEventListeners();
    }
});

//kick the host if they try to change a nono cvar
OnServerCvar((data) => {
    const bannedCvars = new Set([
        "sv_airaccelerate",
        "sv_jump_spam_penalty_time",
        "sv_staminajumpcost",
        "sv_staminalandcost",
        "sv_air_max_wishspeed",
        "sv_enablebunnyhopping",
        "sv_accelerate",
        "sv_autobunnyhopping"
    ]);

    if (bannedCvars.has(data.cvarname)) {
        css.ServerCommand(`kickid 0`);
    }
});

//print hurt data using blips
OnPlayerHurt((data) => {
    const attackerName = css.GetPlayerController(data.attacker)?.GetPlayerName();
    const victimName = css.GetPlayerController(data.userid)?.GetPlayerName();
    const limb = HitGroup[data.hitgroup];

    const msg = `{red}${attackerName}{white}[${data.weapon}]{blue}${victimName}{white} (${limb}) | {yellow}DMG - HP:${data.dmg_health}  A:${data.dmg_armor}{white} | {green}LEFT - HP:${data.health}  A:${data.armor}`);

    blips.print(msg);
});

function think() {
    const gameTime = css.GetGameTime();
    blips.update(gameTime);
    css.SetNextThink(gameTime + 0.015625);
}

blips.print("{white}ⓘ {yellow}Welcome to Movement Hub V2!");
blips.print("{white}ⓘ {yellow}Welcome to Movement Hub V2!");
blips.print("{white}ⓘ {yellow}Welcome to Movement Hub V2!");

css.SetNextThink(css.GetGameTime() + 0.015625);
css.SetThink(() => think());
