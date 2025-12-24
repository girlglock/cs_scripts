// to be used with https://github.com/Source2ZE/cs_script_boilerplate
//
// requires the maps/prefabs/eventlisteners.vmap prefab
// (if not worky paste the ents into main map since hammer likes to alter the targetnames inside prefabs)
//
// example: import { OnPlayerDeath, OnRoundStart } from './_ext/eventlisteners/eventlisteners';
// noinspection JSUnusedGlobalSymbols

import {Instance as css} from "cs_script/point_script";

const _handlers: Map<string, ((data: any) => void)[]> = new Map();
let _registered = false;

export function RegisterAllEventListeners(): void {
    if (_registered) {
        css.Msg("[EventListeners] event listeners already registered");
        return;
    }

    const eventListeners = css.FindEntitiesByClass("logic_eventlistener");

    eventListeners.forEach(listener => {
        const eventName = listener.GetEntityName();

        css.ConnectOutput(listener, "OnEventFired", (data) => {
            let value = {};

            if (typeof data?.value === "string") {
                value = JSON.parse(data.value);
            } else if (typeof data?.value === "object" && data.value !== null) {
                value = data.value;
            }

            const handlers = _handlers.get(eventName);
            if (handlers) {
                handlers.forEach(handler => handler(value));
            }
        });
    });

    _registered = true;
    css.Msg(`[EventListeners] registered ${eventListeners.length} event listeners`);
}

function _subscribe<T>(eventName: string, callback: (data: T) => void): void {
    if (!_handlers.has(eventName)) {
        _handlers.set(eventName, []);
    }
    _handlers.get(eventName)!.push(callback as (data: any) => void);
}

/** send once a server starts */
export type ServerSpawnEvent = {
    /** public host name */
    hostname: string;
    /** hostame, IP or DNS name */
    address: string;
    /** server port */
    port: number;
    /** game dir */
    game: string;
    /** map name */
    mapname: string;
    /** addon name */
    addonname: string;
    /** max players */
    maxplayers: number;
    /** WIN32, LINUX */
    os: string;
    /** true if dedicated server */
    dedicated: boolean;
    /** true if password protected */
    password: boolean
};
/** server is about to be shut down */
export type ServerPreShutdownEvent = {
    /** reason why server is about to be shut down */
    reason: string
};
/** server shut down */
export type ServerShutdownEvent = {
    /** reason why server was shut down */
    reason: string
};
/** a generic server message */
export type ServerMessageEvent = {
    /** the message text */
    text: string
};
/** a server console var has changed */
export type ServerCvarEvent = {
    /** cvar name, eg "mp_roundtime" */
    cvarname: string;
    /** new cvar value */
    cvarvalue: string
};
export type PlayerActivateEvent = {
    /** user ID on server */
    userid: number
};
/** player has sent final message in the connection sequence */
export type PlayerConnectFullEvent = {
    /** user ID on server (unique on server) */
    userid: number
};
export type PlayerFullUpdateEvent = {
    /** user ID on server */
    userid: number;
    /** Number of this full update */
    count: number
};
/** a new client connected */
export type PlayerConnectEvent = {
    /** player name */
    name: string;
    /** user ID on server (unique on server) */
    userid: number;
    /** player network (i.e steam) id */
    networkid: string;
    /** steam id */
    xuid: string;
    /** ip:port */
    address: string;
    bot: boolean
};
/** a client was disconnected */
export type PlayerDisconnectEvent = {
    /** user ID on server */
    userid: number;
    /** see networkdisconnect enum protobuf */
    reason: number;
    /** player name */
    name: string;
    /** player network (i.e steam) id */
    networkid: string;
    /** steam id */
    xuid: string;
    PlayerID: number
};
/** a player changed his name */
export type PlayerInfoEvent = {
    /** player name */
    name: string;
    /** user ID on server (unique on server) */
    userid: number;
    /** player network (i.e steam) id */
    steamid: string;
    /** true if player is an AI bot */
    bot: boolean
};
/** player spawned in game */
export type PlayerSpawnEvent = {
    userid: number;
    userid_pawn: number
};
/** player change his team. You can receive this on the client before the local player has updated the team field locally */
export type PlayerTeamEvent = {
    /** player */
    userid: number;
    /** team id */
    team: number;
    /** old team id */
    oldteam: number;
    /** team change because player disconnects */
    disconnect: boolean;
    silent: boolean;
    /** true if player is a bot */
    isbot: boolean;
    userid_pawn: number
};
/** sent only on the client for the local player - happens only after a local players pawn team variable has been updated */
export type LocalPlayerTeamEvent = {};
/** sent only on the client for the local player - happens only after the local players controller team variable has been updated */
export type LocalPlayerControllerTeamEvent = {};
export type PlayerChangenameEvent = {
    /** user ID on server */
    userid: number;
    /** players old (current) name */
    oldname: string;
    /** players new name */
    newname: string
};
export type PlayerHurtEvent = {
    /** player index who was hurt */
    userid: number;
    /** player index who attacked */
    attacker: number;
    /** remaining health points */
    health: number;
    /** remaining armor points */
    armor: number;
    /** weapon name attacker used, if not the world */
    weapon: string;
    /** damage done to health */
    dmg_health: number;
    /** damage done to armor */
    dmg_armor: number;
    /** hitgroup that was damaged */
    hitgroup: number;
    userid_pawn: number;
    attacker_pawn: number
};
export type LocalPlayerPawnChangedEvent = {};
export type PlayerStatsUpdatedEvent = {
    forceupload: boolean
};
/** a game event, name may be 32 characters long */
export type PlayerDeathEvent = {
    /** user who died */
    userid: number;
    /** player who killed */
    attacker: number;
    /** player who assisted in the kill */
    assister: number;
    /** assister helped with a flash */
    assistedflash: boolean;
    /** weapon name killer used */
    weapon: string;
    /** inventory item id of weapon killer used */
    weapon_itemid: string;
    /** faux item id of weapon killer used */
    weapon_fauxitemid: string;
    weapon_originalowner_xuid: string;
    /** singals a headshot */
    headshot: boolean;
    /** did killer dominate victim with this kill */
    dominated: number;
    /** did killer get revenge on victim with this kill */
    revenge: number;
    /** is the kill resulting in squad wipe */
    wipe: number;
    /** number of objects shot penetrated before killing target */
    penetrated: number;
    /** if replay data is unavailable, this will be present and set to false */
    noreplay: boolean;
    /** kill happened without a scope, used for death notice icon */
    noscope: boolean;
    /** hitscan weapon went through smoke grenade */
    thrusmoke: boolean;
    /** attacker was blind from flashbang */
    attackerblind: boolean;
    /** distance to victim in meters */
    distance: number;
    userid_pawn: number;
    attacker_pawn: number;
    assister_pawn: number;
    /** damage done to health */
    dmg_health: number;
    /** damage done to armor */
    dmg_armor: number;
    /** hitgroup that was damaged */
    hitgroup: number;
    /** attacker was in midair */
    attackerinair: boolean
};
export type PlayerFootstepEvent = {
    userid: number;
    userid_pawn: number
};
export type PlayerHintmessageEvent = {
    /** localizable string of a hint */
    hintmessage: string
};
export type PlayerSpawnedEvent = {
    userid: number;
    /** true if restart is pending */
    inrestart: boolean;
    userid_pawn: number
};
export type PlayerJumpEvent = {
    userid: number
};
export type PlayerBlindEvent = {
    userid: number;
    /** user ID who threw the flash */
    attacker: number;
    /** the flashbang going off */
    entityid: number;
    blind_duration: number
};
export type PlayerFalldamageEvent = {
    userid: number;
    damage: number;
    userid_pawn: number
};
/** players scores changed */
export type PlayerScoreEvent = {
    /** user ID on server */
    userid: number;
    /** # of kills */
    kills: number;
    /** # of deaths */
    deaths: number;
    /** total game score */
    score: number
};
/** player shoot his weapon */
export type PlayerShootEvent = {
    /** user ID on server */
    userid: number;
    /** weapon ID */
    weapon: number;
    /** weapon mode */
    mode: number;
    userid_pawn: number
};
export type PlayerRadioEvent = {
    splitscreenplayer: number;
    userid: number;
    slot: number;
    userid_pawn: number
};
export type PlayerAvengedTeammateEvent = {
    avenger_id: number;
    avenged_player_id: number
};
export type PlayerResetVoteEvent = {
    userid: number;
    vote: boolean
};
export type PlayerGivenC4Event = {
    /** user ID who received the c4 */
    userid: number
};
export type PlayerPingEvent = {
    splitscreenplayer: number;
    userid: number;
    entityid: number;
    x: number;
    y: number;
    z: number;
    urgent: boolean;
    userid_pawn: number
};
export type PlayerPingStopEvent = {
    entityid: number
};
export type PlayerSoundEvent = {
    userid: number;
    radius: number;
    duration: number;
    step: boolean;
    userid_pawn: number
};
/** emits a sound to everyone on a team */
export type TeamplayBroadcastAudioEvent = {
    /** unique team id */
    team: number;
    /** name of the sound to emit */
    sound: string
};
/** info about team */
export type TeamInfoEvent = {
    /** unique team id */
    teamid: number;
    /** team name eg "Team Blue" */
    teamname: string
};
/** team score changed */
export type TeamScoreEvent = {
    /** team id */
    teamid: number;
    /** total team score */
    score: number
};
/** round restart */
export type TeamplayRoundStartEvent = {
    /** is this a full reset of the map */
    full_reset: boolean
};
export type TeamIntroStartEvent = {};
export type TeamIntroEndEvent = {};
export type RoundStartEvent = {
    /** round time limit in seconds */
    timelimit: number;
    /** frag limit in seconds */
    fraglimit: number;
    /** round objective */
    objective: string
};
export type RoundEndEvent = {
    /** winner team/user i */
    winner: number;
    /** reson why team won */
    reason: number;
    /** end round message */
    message: string;
    /** server-generated legacy value */
    legacy: number;
    /** total number of players alive at the end of round, used for statistics gathering, computed on the server in the event client is in replay when receiving this message */
    player_count: number;
    /** if set, don't play round end music, because action is still ongoing */
    nomusic: number
};
export type RoundStartPreEntityEvent = {};
export type RoundStartPostNavEvent = {};
export type RoundFreezeEndEvent = {};
/** sent before all other round restart actions */
export type RoundPrestartEvent = {};
/** sent after all other round restart actions */
export type RoundPoststartEvent = {};
export type RoundAnnounceMatchPointEvent = {};
export type RoundAnnounceFinalEvent = {};
export type RoundAnnounceLastRoundHalfEvent = {};
export type RoundAnnounceMatchStartEvent = {};
export type RoundAnnounceWarmupEvent = {};
export type RoundEndUploadStatsEvent = {};
export type RoundOfficiallyEndedEvent = {};
export type RoundTimeWarningEvent = {};
export type RoundMvpEvent = {
    userid: number;
    reason: number;
    value: number;
    musickitmvps: number;
    nomusic: number;
    musickitid: number
};
/** sent when a new game is started */
export type GameInitEvent = {};
/** a new game starts */
export type GameStartEvent = {
    /** max round */
    roundslimit: number;
    /** time limit */
    timelimit: number;
    /** frag limit */
    fraglimit: number;
    /** round objective */
    objective: string
};
/** a game ended */
export type GameEndEvent = {
    /** winner team/user id */
    winner: number
};
/** a message send by game logic to everyone */
export type GameMessageEvent = {
    /** 0 = console, 1 = HUD */
    target: number;
    /** the message text */
    text: string
};
/** send when new map is completely loaded */
export type GameNewmapEvent = {
    /** map name */
    mapname: string
};
export type GamePhaseChangedEvent = {
    new_phase: number
};
/** a spectator/player is a cameraman */
export type HltvCameramanEvent = {
    /** cameraman entity index */
    userid: number
};
/** shot of a single entity */
export type HltvChaseEvent = {
    /** primary traget index */
    target1: number;
    /** secondary traget index or 0 */
    target2: number;
    /** camera distance */
    distance: number;
    /** view angle horizontal */
    theta: number;
    /** view angle vertical */
    phi: number;
    /** camera inertia */
    inertia: number;
    /** diretcor suggests to show ineye */
    ineye: number
};
/** a camera ranking */
export type HltvRankCameraEvent = {
    /** fixed camera index */
    index: number;
    /** ranking, how interesting is this camera view */
    rank: number;
    /** best/closest target entity */
    target: number
};
/** an entity ranking */
export type HltvRankEntityEvent = {
    /** player slot */
    userid: number;
    /** ranking, how interesting is this entity to view */
    rank: number;
    /** best/closest target entity */
    target: number
};
/** show from fixed view */
export type HltvFixedEvent = {
    /** camera position in world */
    posx: number;
    posy: number;
    posz: number;
    /** camera angles */
    theta: number;
    phi: number;
    offset: number;
    fov: number;
    /** follow this player */
    target: number
};
/** a HLTV message send by moderators */
export type HltvMessageEvent = {
    text: string
};
/** general HLTV status */
export type HltvStatusEvent = {
    /** number of HLTV spectators */
    clients: number;
    /** number of HLTV slots */
    slots: number;
    /** number of HLTV proxies */
    proxies: number;
    /** disptach master IP:port */
    master: string
};
export type HltvTitleEvent = {
    text: string
};
/** a HLTV chat msg sent by spectators */
export type HltvChatEvent = {
    text: string;
    /** steam id */
    steamID: string
};
export type HltvVersioninfoEvent = {
    version: number
};
export type HltvReplayEvent = {
    /** number of seconds in killer replay delay */
    delay: number;
    /** reason for replay	(ReplayEventType_t) */
    reason: number
};
export type HltvChangedModeEvent = {
    oldmode: number;
    newmode: number;
    obs_target: number
};
export type HltvReplayStatusEvent = {
    reason: number
};
export type DemoStartEvent = {};
export type DemoStopEvent = {};
export type DemoSkipEvent = {
    /** current playback tick */
    playback_tick: number;
    /** tick we're going to */
    skipto_tick: number
};
export type MapShutdownEvent = {};
export type MapTransitionEvent = {};
export type HostnameChangedEvent = {
    hostname: string
};
export type DifficultyChangedEvent = {
    newDifficulty: number;
    oldDifficulty: number;
    /** new difficulty as string */
    strDifficulty: string
};
export type WeaponFireEvent = {
    userid: number;
    /** weapon name used */
    weapon: string;
    /** is weapon silenced */
    silenced: boolean;
    userid_pawn: number
};
export type WeaponFireOnEmptyEvent = {
    userid: number;
    /** weapon name used */
    weapon: string;
    userid_pawn: number
};
export type WeaponOutofammoEvent = {
    userid: number;
    userid_pawn: number
};
export type WeaponReloadEvent = {
    userid: number;
    userid_pawn: number
};
export type WeaponZoomEvent = {
    userid: number;
    userid_pawn: number
};
/** exists for the game instructor to let it know when the player zoomed in with a regular rifle. Different from the above weapon_zoom because we don't use this event to notify bots */
export type WeaponZoomRifleEvent = {
    userid: number;
    userid_pawn: number
};
export type GrenadeThrownEvent = {
    userid: number;
    /** weapon name used */
    weapon: string;
    userid_pawn: number
};
export type GrenadeBounceEvent = {
    userid: number;
    userid_pawn: number
};
export type HegrenadeDetonateEvent = {
    userid: number;
    entityid: number;
    x: number;
    y: number;
    z: number;
    userid_pawn: number
};
export type FlashbangDetonateEvent = {
    userid: number;
    entityid: number;
    x: number;
    y: number;
    z: number;
    userid_pawn: number
};
export type SmokegrenadeDetonateEvent = {
    userid: number;
    entityid: number;
    x: number;
    y: number;
    z: number;
    userid_pawn: number
};
export type SmokegrenadeExpiredEvent = {
    userid: number;
    entityid: number;
    x: number;
    y: number;
    z: number;
    userid_pawn: number
};
export type MolotovDetonateEvent = {
    userid: number;
    x: number;
    y: number;
    z: number;
    userid_pawn: number
};
export type DecoyDetonateEvent = {
    userid: number;
    entityid: number;
    x: number;
    y: number;
    z: number;
    userid_pawn: number
};
export type DecoyStartedEvent = {
    userid: number;
    entityid: number;
    x: number;
    y: number;
    z: number;
    userid_pawn: number
};
export type DecoyFiringEvent = {
    userid: number;
    entityid: number;
    x: number;
    y: number;
    z: number;
    userid_pawn: number
};
export type TagrenadeDetonateEvent = {
    userid: number;
    entityid: number;
    x: number;
    y: number;
    z: number
};
export type InfernoStartburnEvent = {
    entityid: number;
    x: number;
    y: number;
    z: number
};
export type InfernoExpireEvent = {
    entityid: number;
    x: number;
    y: number;
    z: number
};
export type InfernoExtinguishEvent = {
    entityid: number;
    x: number;
    y: number;
    z: number
};
export type BombBeginplantEvent = {
    /** player who is planting the bomb */
    userid: number;
    /** bombsite index */
    site: number;
    userid_pawn: number
};
export type BombAbortplantEvent = {
    /** player who is planting the bomb */
    userid: number;
    /** bombsite index */
    site: number;
    userid_pawn: number
};
export type BombPlantedEvent = {
    /** player who planted the bomb */
    userid: number;
    /** bombsite index */
    site: number;
    userid_pawn: number
};
export type BombBegindefuseEvent = {
    /** player who is defusing */
    userid: number;
    haskit: boolean;
    userid_pawn: number
};
export type BombAbortdefuseEvent = {
    /** player who was defusing */
    userid: number;
    userid_pawn: number
};
export type BombDefusedEvent = {
    /** player who defused the bomb */
    userid: number;
    /** bombsite index */
    site: number;
    userid_pawn: number
};
export type BombExplodedEvent = {
    /** player who planted the bomb */
    userid: number;
    /** bombsite index */
    site: number;
    userid_pawn: number
};
export type BombDroppedEvent = {
    /** player who dropped the bomb */
    userid: number;
    entindex: number;
    userid_pawn: number
};
export type BombPickupEvent = {
    userid: number;
    userid_pawn: number
};
export type BombBeepEvent = {
    /** c4 entity */
    entindex: number
};
export type DefuserDroppedEvent = {
    /** defuser's entity ID */
    entityid: number
};
export type DefuserPickupEvent = {
    /** defuser's entity ID */
    entityid: number;
    /** player who picked up the defuser */
    userid: number;
    userid_pawn: number
};
export type HostageFollowsEvent = {
    /** player who touched the hostage */
    userid: number;
    /** hostage entity index */
    hostage: number;
    userid_pawn: number
};
export type HostageHurtEvent = {
    /** player who hurt the hostage */
    userid: number;
    /** hostage entity index */
    hostage: number;
    userid_pawn: number
};
export type HostageKilledEvent = {
    /** player who killed the hostage */
    userid: number;
    /** hostage entity index */
    hostage: number;
    userid_pawn: number
};
export type HostageRescuedEvent = {
    /** player who rescued the hostage */
    userid: number;
    /** hostage entity index */
    hostage: number;
    /** rescue site index */
    site: number;
    userid_pawn: number
};
export type HostageStopsFollowingEvent = {
    /** player who rescued the hostage */
    userid: number;
    /** hostage entity index */
    hostage: number;
    userid_pawn: number
};
export type HostageRescuedAllEvent = {};
export type HostageCallForHelpEvent = {
    /** hostage entity index */
    hostage: number
};
export type VipEscapedEvent = {
    /** player who was the VIP */
    userid: number
};
export type VipKilledEvent = {
    /** player who was the VIP */
    userid: number;
    /** user ID who killed the VIP */
    attacker: number
};
export type ItemPurchaseEvent = {
    userid: number;
    team: number;
    loadout: number;
    weapon: string
};
export type ItemPickupEvent = {
    userid: number;
    /** either a weapon such as 'tmp' or 'hegrenade', or an item such as 'nvgs' */
    item: string;
    silent: boolean;
    defindex: number
};
export type ItemPickupSlerpEvent = {
    userid: number;
    index: number;
    behavior: number
};
export type ItemPickupFailedEvent = {
    userid: number;
    item: string;
    reason: number;
    limit: number
};
export type ItemRemoveEvent = {
    userid: number;
    /** either a weapon such as 'tmp' or 'hegrenade', or an item such as 'nvgs' */
    item: string;
    defindex: number
};
export type ItemEquipEvent = {
    userid: number;
    /** either a weapon such as 'tmp' or 'hegrenade', or an item such as 'nvgs' */
    item: string;
    defindex: number;
    canzoom: boolean;
    hassilencer: boolean;
    issilenced: boolean;
    hastracers: boolean;
    weptype: number;
    ispainted: boolean
};
export type ItemSchemaInitializedEvent = {};
export type AmmoPickupEvent = {
    userid: number;
    /** either a weapon such as 'tmp' or 'hegrenade', or an item such as 'nvgs' */
    item: string;
    /** the weapon entindex */
    index: number
};
export type AmmoRefillEvent = {
    userid: number;
    success: boolean
};
export type EnterBuyzoneEvent = {
    userid: number;
    canbuy: boolean
};
export type ExitBuyzoneEvent = {
    userid: number;
    canbuy: boolean
};
export type EnterBombzoneEvent = {
    userid: number;
    hasbomb: boolean;
    isplanted: boolean
};
export type ExitBombzoneEvent = {
    userid: number;
    hasbomb: boolean;
    isplanted: boolean
};
export type EnterRescueZoneEvent = {
    userid: number
};
export type ExitRescueZoneEvent = {
    userid: number
};
export type BuytimeEndedEvent = {};
export type SilencerOffEvent = {
    userid: number
};
export type SilencerOnEvent = {
    userid: number
};
export type SilencerDetachEvent = {
    userid: number;
    userid_pawn: number
};
export type BuymenuOpenEvent = {
    userid: number
};
export type BuymenuCloseEvent = {
    userid: number
};
export type InspectWeaponEvent = {
    userid: number;
    userid_pawn: number
};
export type OtherDeathEvent = {
    /** other entity ID who died */
    otherid: number;
    /** other entity type */
    othertype: string;
    /** user ID who killed */
    attacker: number;
    /** weapon name killer used */
    weapon: string;
    /** inventory item id of weapon killer used */
    weapon_itemid: string;
    /** faux item id of weapon killer used */
    weapon_fauxitemid: string;
    weapon_originalowner_xuid: string;
    /** singals a headshot */
    headshot: boolean;
    /** number of objects shot penetrated before killing target */
    penetrated: number;
    /** kill happened without a scope, used for death notice icon */
    noscope: boolean;
    /** hitscan weapon went through smoke grenade */
    thrusmoke: boolean;
    /** attacker was blind from flashbang */
    attackerblind: boolean
};
export type BulletImpactEvent = {
    userid: number;
    x: number;
    y: number;
    z: number;
    userid_pawn: number
};
export type BulletFlightResolutionEvent = {
    userid: number;
    userid_pawn: number;
    pos_x: number;
    pos_y: number;
    pos_z: number;
    ang_x: number;
    ang_y: number;
    ang_z: number;
    start_x: number;
    start_y: number;
    start_z: number
};
export type DoorCloseEvent = {
    userid: number;
    /** Is the door a checkpoint door */
    checkpoint: boolean;
    userid_pawn: number
};
export type DoorMovingEvent = {
    userid: number;
    entindex: number;
    userid_pawn: number
};
export type DoorBreakEvent = {
    entindex: number;
    dmgstate: number
};
export type DoorClosedEvent = {
    userid_pawn: number;
    entindex: number
};
export type DoorOpenEvent = {
    userid_pawn: number;
    entindex: number
};
export type BreakBreakableEvent = {
    entindex: number;
    userid: number;
    /** BREAK_GLASS, BREAK_WOOD, etc */
    material: number;
    userid_pawn: number
};
export type BreakPropEvent = {
    entindex: number;
    userid: number;
    userid_pawn: number
};
export type BrokenBreakableEvent = {
    entindex: number;
    userid: number;
    /** BREAK_GLASS, BREAK_WOOD, etc */
    material: number;
    userid_pawn: number
};
export type EntityKilledEvent = {
    entindex_killed: number;
    entindex_attacker: number;
    entindex_inflictor: number;
    damagebits: number
};
export type EntityVisibleEvent = {
    /** The player who sees the entity */
    userid: number;
    /** Entindex of the entity they see */
    subject: number;
    /** Classname of the entity they see */
    classname: string;
    /** name of the entity they see */
    entityname: string
};
export type VoteStartedEvent = {
    issue: string;
    param1: string;
    team: number;
    /** entity id of the player who initiated the vote */
    initiator: number
};
export type VoteFailedEvent = {
    team: number
};
export type VotePassedEvent = {
    details: string;
    param1: string;
    team: number
};
export type VoteChangedEvent = {
    vote_option1: number;
    vote_option2: number;
    vote_option3: number;
    vote_option4: number;
    vote_option5: number;
    potentialVotes: number
};
export type VoteCastYesEvent = {
    team: number;
    /** entity id of the voter */
    entityid: number
};
export type VoteCastNoEvent = {
    team: number;
    /** entity id of the voter */
    entityid: number
};
export type VoteCastEvent = {
    /** which option the player voted on */
    vote_option: number;
    team: number;
    /** player who voted */
    userid: number
};
export type VoteEndedEvent = {};
export type VoteOptionsEvent = {
    /** Number of options - up to MAX_VOTE_OPTIONS */
    count: number;
    option1: string;
    option2: string;
    option3: string;
    option4: string;
    option5: string
};
export type StartVoteEvent = {
    userid: number;
    type: number;
    vote_parameter: number
};
export type EnableRestartVotingEvent = {
    enable: boolean
};
export type AchievementEventEvent = {
    /** non-localized name of achievement */
    achievement_name: string;
    /** # of steps toward achievement */
    cur_val: number;
    /** total # of steps in achievement */
    max_val: number
};
export type AchievementEarnedEvent = {
    /** entindex of the player */
    player: number;
    /** achievement ID */
    achievement: number
};
export type AchievementEarnedLocalEvent = {
    /** achievement ID */
    achievement: number;
    /** splitscreen ID */
    splitscreenplayer: number
};
/** Used for a notification message when an achievement fails to write */
export type AchievementWriteFailedEvent = {};
export type AchievementInfoLoadedEvent = {};
export type BonusUpdatedEvent = {
    numadvanced: number;
    numbronze: number;
    numsilver: number;
    numgold: number
};
export type SpecTargetUpdatedEvent = {
    /** spectating player */
    userid: number;
    /** ehandle of the target */
    target: number;
    userid_pawn: number
};
export type SpecModeUpdatedEvent = {
    /** entindex of the player */
    userid: number
};
export type GameinstructorDrawEvent = {};
export type GameinstructorNodrawEvent = {};
export type InstructorStartLessonEvent = {
    /** The player who this lesson is intended for */
    userid: number;
    /** Name of the lesson to start.  Must match instructor_lesson.txt */
    hint_name: string;
    /** entity id that the hint should display at. Leave empty if controller target */
    hint_target: number;
    vr_movement_type: number;
    vr_single_controller: boolean;
    vr_controller_type: number
};
export type InstructorCloseLessonEvent = {
    /** The player who this lesson is intended for */
    userid: number;
    /** Name of the lesson to start.  Must match instructor_lesson.txt */
    hint_name: string
};
/** create a hint using data supplied entirely by the server/map. Intended for hints to smooth playtests before content is ready to make the hint unneccessary. NOT INTENDED AS A SHIPPABLE CRUTCH */
export type InstructorServerHintCreateEvent = {
    /** user ID of the player that triggered the hint */
    userid: number;
    /** what to name the hint. For referencing it again later (e.g. a kill command for the hint instead of a timeout) */
    hint_name: string;
    /** type name so that messages of the same type will replace each other */
    hint_replace_key: string;
    /** entity id that the hint should display at */
    hint_target: number;
    /** userid id of the activator */
    hint_activator_userid: number;
    /** how long in seconds until the hint automatically times out, 0 = never */
    hint_timeout: number;
    /** the hint icon to use when the hint is onscreen. e.g. "icon_alert_red" */
    hint_icon_onscreen: string;
    /** the hint icon to use when the hint is offscreen. e.g. "icon_alert" */
    hint_icon_offscreen: string;
    /** the hint caption. e.g. "#ThisIsDangerous" */
    hint_caption: string;
    /** the hint caption that only the activator sees e.g. "#YouPushedItGood" */
    hint_activator_caption: string;
    /** the hint color in "r,g,b" format where each component is 0-255 */
    hint_color: string;
    /** how far on the z axis to offset the hint from entity origin */
    hint_icon_offset: number;
    /** range before the hint is culled */
    hint_range: number;
    /** hint flags */
    hint_flags: number;
    /** bindings to use when use_binding is the onscreen icon */
    hint_binding: string;
    /** gamepad bindings to use when use_binding is the onscreen icon */
    hint_gamepad_binding: string;
    /** if false, the hint will dissappear if the target entity is invisible */
    hint_allow_nodraw_target: boolean;
    /** if true, the hint will not show when outside the player view */
    hint_nooffscreen: boolean;
    /** if true, the hint caption will show even if the hint is occluded */
    hint_forcecaption: boolean;
    /** if true, only the local player will see the hint */
    hint_local_player_only: boolean
};
/** destroys a server/map created hint */
export type InstructorServerHintStopEvent = {
    /** The hint to stop. Will stop ALL hints with this name */
    hint_name: string
};
export type ClientsideLessonClosedEvent = {
    lesson_name: string
};
export type SetInstructorGroupEnabledEvent = {
    group: string;
    enabled: number
};
export type PhysgunPickupEvent = {
    /** entity picked up */
    target: number
};
export type FlareIgniteNpcEvent = {
    /** entity ignited */
    entindex: number
};
export type HelicopterGrenadePuntMissEvent = {};
export type FinaleStartEvent = {
    rushes: number
};
/** fired when achievements/stats are downloaded from Steam or Xbox Live */
export type UserDataDownloadedEvent = {};
/** read user titledata from profile */
export type ReadGameTitledataEvent = {
    /** Controller id of user */
    controllerId: number
};
/** write user titledata in profile */
export type WriteGameTitledataEvent = {
    /** Controller id of user */
    controllerId: number
};
/** reset user titledata; do not automatically write profile */
export type ResetGameTitledataEvent = {
    /** Controller id of user */
    controllerId: number
};
export type WriteProfileDataEvent = {};
export type RagdollDissolvedEvent = {
    entindex: number
};
export type InventoryUpdatedEvent = {};
export type CartUpdatedEvent = {};
export type StorePricesheetUpdatedEvent = {};
export type DropRateModifiedEvent = {};
export type EventTicketModifiedEvent = {};
export type GcConnectedEvent = {};
export type DynamicShadowLightChangedEvent = {};
export type GameuiHiddenEvent = {};
export type ItemsGiftedEvent = {
    /** entity used by player */
    player: number;
    itemdef: number;
    numgifts: number;
    giftidx: number;
    accountid: number
};
export type WarmupEndEvent = {};
export type AnnouncePhaseEndEvent = {};
export type CsIntermissionEvent = {};
export type CsGameDisconnectedEvent = {};
export type CsRoundFinalBeepEvent = {};
export type CsRoundStartBeepEvent = {};
export type CsWinPanelRoundEvent = {
    show_timer_defend: boolean;
    show_timer_attack: boolean;
    timer_time: number;
    /** define in cs_gamerules.h */
    final_event: number;
    funfact_token: string;
    funfact_player: number;
    funfact_data1: number;
    funfact_data2: number;
    funfact_data3: number
};
export type CsWinPanelMatchEvent = {};
export type CsMatchEndRestartEvent = {};
export type CsPreRestartEvent = {};
export type CsPrevNextSpectatorEvent = {
    next: boolean
};
export type ShowDeathpanelEvent = {
    /** endindex of the one who was killed */
    victim: number;
    /** entindex of the killer entity */
    killer: number;
    killer_controller: number;
    hits_taken: number;
    damage_taken: number;
    hits_given: number;
    damage_given: number;
    victim_pawn: number
};
export type HideDeathpanelEvent = {};
export type UgcMapInfoReceivedEvent = {
    published_file_id: string
};
export type UgcMapUnsubscribedEvent = {
    published_file_id: string
};
export type UgcMapDownloadErrorEvent = {
    published_file_id: string;
    error_code: number
};
export type UgcFileDownloadFinishedEvent = {
    /** id of this specific content (can be an image or map) */
    hcontent: string
};
export type UgcFileDownloadStartEvent = {
    /** id of this specific content (can be an image or map) */
    hcontent: string;
    /** id of the associated content package */
    published_file_id: string
};
/** Fired when a match ends or is restarted */
export type BeginNewMatchEvent = {};
export type MatchEndConditionsEvent = {
    frags: number;
    max_rounds: number;
    win_rounds: number;
    time: number
};
export type EndmatchMapvoteSelectingMapEvent = {
    /** Number of "ties" */
    count: number;
    slot1: number;
    slot2: number;
    slot3: number;
    slot4: number;
    slot5: number;
    slot6: number;
    slot7: number;
    slot8: number;
    slot9: number;
    slot10: number
};
export type EndmatchCmmStartRevealItemsEvent = {};
/** a game event, name may be 32 characters long */
export type NextlevelChangedEvent = {
    nextlevel: string;
    mapgroup: string;
    skirmishmode: string
};
export type DmBonusWeaponStartEvent = {
    /** The length of time that this bonus lasts */
    time: number;
    /** Loadout position of the bonus weapon */
    Pos: number
};
export type GgKilledEnemyEvent = {
    /** user ID who died */
    victimid: number;
    /** user ID who killed */
    attackerid: number;
    /** did killer dominate victim with this kill */
    dominated: number;
    /** did killer get revenge on victim with this kill */
    revenge: number;
    /** did killer kill with a bonus weapon? */
    bonus: boolean
};
export type SwitchTeamEvent = {
    /** number of active players on both T and CT */
    numPlayers: number;
    /** number of spectators */
    numSpectators: number;
    /** average rank of human players */
    avg_rank: number;
    numTSlotsFree: number;
    numCTSlotsFree: number
};
/** fired when a player runs out of time in trial mode */
export type TrialTimeExpiredEvent = {
    /** player whose time has expired */
    userid: number
};
/** Fired when it's time to update matchmaking data at the end of a round. */
export type UpdateMatchmakingStatsEvent = {};
export type ClientDisconnectEvent = {};
export type ClientLoadoutChangedEvent = {};
export type AddPlayerSonarIconEvent = {
    userid: number;
    pos_x: number;
    pos_y: number;
    pos_z: number
};
export type AddBulletHitMarkerEvent = {
    userid: number;
    bone: number;
    pos_x: number;
    pos_y: number;
    pos_z: number;
    ang_x: number;
    ang_y: number;
    ang_z: number;
    start_x: number;
    start_y: number;
    start_z: number;
    hit: boolean
};
export type SfuieventEvent = {
    action: string;
    data: string;
    slot: number
};
export type WeaponhudSelectionEvent = {
    /** Player who this event applies to */
    userid: number;
    /** EWeaponHudSelectionMode (switch / pickup / drop) */
    mode: number;
    /** Weapon entity index */
    entindex: number;
    userid_pawn: number
};
export type TrPlayerFlashbangedEvent = {
    /** user ID of the player banged */
    userid: number
};
export type TrMarkCompleteEvent = {
    complete: number
};
export type TrMarkBestTimeEvent = {
    time: number
};
export type TrExitHintTriggerEvent = {};
export type TrShowFinishMsgboxEvent = {};
export type TrShowExitMsgboxEvent = {};
export type BotTakeoverEvent = {
    userid: number;
    botid: number;
    userid_pawn: number
};
export type JointeamFailedEvent = {
    userid: number;
    /** 0 = team_full */
    reason: number
};
export type TeamchangePendingEvent = {
    userid: number;
    toteam: number
};
export type MaterialDefaultCompleteEvent = {};
export type SeasoncoinLevelupEvent = {
    userid: number;
    category: number;
    rank: number
};
export type TournamentRewardEvent = {
    defindex: number;
    totalrewards: number;
    accountid: number
};
export type StartHalftimeEvent = {};
export type PlayerDecalEvent = {
    userid: number;
    userid_pawn: number
};
export type SurvivalAnnouncePhaseEvent = {
    /** The phase # */
    phase: number
};
export type ParachutePickupEvent = {
    userid: number
};
export type ParachuteDeployEvent = {
    userid: number
};
export type DronegunAttackEvent = {
    userid: number
};
export type DroneDispatchedEvent = {
    userid: number;
    priority: number;
    drone_dispatched: number
};
export type LootCrateVisibleEvent = {
    /** player entindex */
    userid: number;
    /** crate entindex */
    subject: number;
    /** type of crate (metal, wood, or paradrop) */
    type: string
};
export type LootCrateOpenedEvent = {
    /** player entindex */
    userid: number;
    /** type of crate (metal, wood, or paradrop) */
    type: string
};
export type OpenCrateInstrEvent = {
    /** player entindex */
    userid: number;
    /** crate entindex */
    subject: number;
    /** type of crate (metal, wood, or paradrop) */
    type: string
};
export type SmokeBeaconParadropEvent = {
    userid: number;
    paradrop: number
};
export type SurvivalParadropSpawnEvent = {
    entityid: number
};
export type SurvivalParadropBreakEvent = {
    entityid: number
};
export type DroneCargoDetachedEvent = {
    userid: number;
    cargo: number;
    delivered: boolean
};
export type DroneAboveRoofEvent = {
    userid: number;
    cargo: number
};
export type ChoppersIncomingWarningEvent = {
    global: boolean
};
export type FirstbombsIncomingWarningEvent = {
    global: boolean
};
export type DzItemInteractionEvent = {
    /** player entindex */
    userid: number;
    /** crate entindex */
    subject: number;
    /** type of crate (metal, wood, or paradrop) */
    type: string
};
export type SurvivalTeammateRespawnEvent = {
    userid: number
};
export type SurvivalNoRespawnsWarningEvent = {
    userid: number
};
export type SurvivalNoRespawnsFinalEvent = {
    userid: number
};
export type ShowSurvivalRespawnStatusEvent = {
    loc_token: string;
    duration: number;
    userid: number;
    userid_pawn: number
};
export type GuardianWaveRestartEvent = {};
export type NavBlockedEvent = {
    area: number;
    blocked: boolean
};
export type NavGenerateEvent = {};
export type RepostXboxAchievementsEvent = {
    /** splitscreen ID */
    splitscreenplayer: number
};
export type MbInputLockSuccessEvent = {};
export type MbInputLockCancelEvent = {};

export function OnServerSpawn(callback: (data: ServerSpawnEvent) => void): void {
    _subscribe("server_spawn", callback);
}

export function OnServerPreShutdown(callback: (data: ServerPreShutdownEvent) => void): void {
    _subscribe("server_pre_shutdown", callback);
}

export function OnServerShutdown(callback: (data: ServerShutdownEvent) => void): void {
    _subscribe("server_shutdown", callback);
}

export function OnServerMessage(callback: (data: ServerMessageEvent) => void): void {
    _subscribe("server_message", callback);
}

export function OnServerCvar(callback: (data: ServerCvarEvent) => void): void {
    _subscribe("server_cvar", callback);
}

/** @deprecated Use `Instance.OnPlayerActivate` instead. */
export function OnPlayerActivate(callback: (data: PlayerActivateEvent) => void): void {
    _subscribe("player_activate", callback);
}

export function OnPlayerConnectFull(callback: (data: PlayerConnectFullEvent) => void): void {
    _subscribe("player_connect_full", callback);
}

export function OnPlayerFullUpdate(callback: (data: PlayerFullUpdateEvent) => void): void {
    _subscribe("player_full_update", callback);
}

/** @deprecated Use `Instance.OnPlayerConnect` instead. */
export function OnPlayerConnect(callback: (data: PlayerConnectEvent) => void): void {
    _subscribe("player_connect", callback);
}

/** @deprecated Use `Instance.OnPlayerDisconnect` instead. */
export function OnPlayerDisconnect(callback: (data: PlayerDisconnectEvent) => void): void {
    _subscribe("player_disconnect", callback);
}

export function OnPlayerInfo(callback: (data: PlayerInfoEvent) => void): void {
    _subscribe("player_info", callback);
}

export function OnPlayerSpawn(callback: (data: PlayerSpawnEvent) => void): void {
    _subscribe("player_spawn", callback);
}

export function OnPlayerTeam(callback: (data: PlayerTeamEvent) => void): void {
    _subscribe("player_team", callback);
}

export function OnLocalPlayerTeam(callback: (data: LocalPlayerTeamEvent) => void): void {
    _subscribe("local_player_team", callback);
}

export function OnLocalPlayerControllerTeam(callback: (data: LocalPlayerControllerTeamEvent) => void): void {
    _subscribe("local_player_controller_team", callback);
}

export function OnPlayerChangename(callback: (data: PlayerChangenameEvent) => void): void {
    _subscribe("player_changename", callback);
}

export function OnPlayerHurt(callback: (data: PlayerHurtEvent) => void): void {
    _subscribe("player_hurt", callback);
}

export function OnLocalPlayerPawnChanged(callback: (data: LocalPlayerPawnChangedEvent) => void): void {
    _subscribe("local_player_pawn_changed", callback);
}

export function OnPlayerStatsUpdated(callback: (data: PlayerStatsUpdatedEvent) => void): void {
    _subscribe("player_stats_updated", callback);
}

export function OnPlayerDeath(callback: (data: PlayerDeathEvent) => void): void {
    _subscribe("player_death", callback);
}

export function OnPlayerFootstep(callback: (data: PlayerFootstepEvent) => void): void {
    _subscribe("player_footstep", callback);
}

export function OnPlayerHintmessage(callback: (data: PlayerHintmessageEvent) => void): void {
    _subscribe("player_hintmessage", callback);
}

export function OnPlayerSpawned(callback: (data: PlayerSpawnedEvent) => void): void {
    _subscribe("player_spawned", callback);
}

/** @deprecated Use `Instance.OnPlayerJump` instead. */
export function OnPlayerJump(callback: (data: PlayerJumpEvent) => void): void {
    _subscribe("player_jump", callback);
}

export function OnPlayerBlind(callback: (data: PlayerBlindEvent) => void): void {
    _subscribe("player_blind", callback);
}

export function OnPlayerFalldamage(callback: (data: PlayerFalldamageEvent) => void): void {
    _subscribe("player_falldamage", callback);
}

export function OnPlayerScore(callback: (data: PlayerScoreEvent) => void): void {
    _subscribe("player_score", callback);
}

export function OnPlayerShoot(callback: (data: PlayerShootEvent) => void): void {
    _subscribe("player_shoot", callback);
}

export function OnPlayerRadio(callback: (data: PlayerRadioEvent) => void): void {
    _subscribe("player_radio", callback);
}

export function OnPlayerAvengedTeammate(callback: (data: PlayerAvengedTeammateEvent) => void): void {
    _subscribe("player_avenged_teammate", callback);
}

export function OnPlayerResetVote(callback: (data: PlayerResetVoteEvent) => void): void {
    _subscribe("player_reset_vote", callback);
}

export function OnPlayerGivenC4(callback: (data: PlayerGivenC4Event) => void): void {
    _subscribe("player_given_c4", callback);
}

/** @deprecated Use `Instance.OnPlayerPing` instead. */
export function OnPlayerPing(callback: (data: PlayerPingEvent) => void): void {
    _subscribe("player_ping", callback);
}

export function OnPlayerPingStop(callback: (data: PlayerPingStopEvent) => void): void {
    _subscribe("player_ping_stop", callback);
}

export function OnPlayerSound(callback: (data: PlayerSoundEvent) => void): void {
    _subscribe("player_sound", callback);
}

export function OnTeamplayBroadcastAudio(callback: (data: TeamplayBroadcastAudioEvent) => void): void {
    _subscribe("teamplay_broadcast_audio", callback);
}

export function OnTeamInfo(callback: (data: TeamInfoEvent) => void): void {
    _subscribe("team_info", callback);
}

export function OnTeamScore(callback: (data: TeamScoreEvent) => void): void {
    _subscribe("team_score", callback);
}

export function OnTeamplayRoundStart(callback: (data: TeamplayRoundStartEvent) => void): void {
    _subscribe("teamplay_round_start", callback);
}

export function OnTeamIntroStart(callback: (data: TeamIntroStartEvent) => void): void {
    _subscribe("team_intro_start", callback);
}

export function OnTeamIntroEnd(callback: (data: TeamIntroEndEvent) => void): void {
    _subscribe("team_intro_end", callback);
}

/** @deprecated Use `Instance.OnRoundStart` instead. */
export function OnRoundStart(callback: (data: RoundStartEvent) => void): void {
    _subscribe("round_start", callback);
}

export function OnRoundEnd(callback: (data: RoundEndEvent) => void): void {
    _subscribe("round_end", callback);
}

export function OnRoundStartPreEntity(callback: (data: RoundStartPreEntityEvent) => void): void {
    _subscribe("round_start_pre_entity", callback);
}

export function OnRoundStartPostNav(callback: (data: RoundStartPostNavEvent) => void): void {
    _subscribe("round_start_post_nav", callback);
}

export function OnRoundFreezeEnd(callback: (data: RoundFreezeEndEvent) => void): void {
    _subscribe("round_freeze_end", callback);
}

export function OnRoundPrestart(callback: (data: RoundPrestartEvent) => void): void {
    _subscribe("round_prestart", callback);
}

export function OnRoundPoststart(callback: (data: RoundPoststartEvent) => void): void {
    _subscribe("round_poststart", callback);
}

export function OnRoundAnnounceMatchPoint(callback: (data: RoundAnnounceMatchPointEvent) => void): void {
    _subscribe("round_announce_match_point", callback);
}

export function OnRoundAnnounceFinal(callback: (data: RoundAnnounceFinalEvent) => void): void {
    _subscribe("round_announce_final", callback);
}

export function OnRoundAnnounceLastRoundHalf(callback: (data: RoundAnnounceLastRoundHalfEvent) => void): void {
    _subscribe("round_announce_last_round_half", callback);
}

export function OnRoundAnnounceMatchStart(callback: (data: RoundAnnounceMatchStartEvent) => void): void {
    _subscribe("round_announce_match_start", callback);
}

export function OnRoundAnnounceWarmup(callback: (data: RoundAnnounceWarmupEvent) => void): void {
    _subscribe("round_announce_warmup", callback);
}

export function OnRoundEndUploadStats(callback: (data: RoundEndUploadStatsEvent) => void): void {
    _subscribe("round_end_upload_stats", callback);
}

export function OnRoundOfficiallyEnded(callback: (data: RoundOfficiallyEndedEvent) => void): void {
    _subscribe("round_officially_ended", callback);
}

export function OnRoundTimeWarning(callback: (data: RoundTimeWarningEvent) => void): void {
    _subscribe("round_time_warning", callback);
}

export function OnRoundMvp(callback: (data: RoundMvpEvent) => void): void {
    _subscribe("round_mvp", callback);
}

export function OnGameInit(callback: (data: GameInitEvent) => void): void {
    _subscribe("game_init", callback);
}

export function OnGameStart(callback: (data: GameStartEvent) => void): void {
    _subscribe("game_start", callback);
}

export function OnGameEnd(callback: (data: GameEndEvent) => void): void {
    _subscribe("game_end", callback);
}

export function OnGameMessage(callback: (data: GameMessageEvent) => void): void {
    _subscribe("game_message", callback);
}

export function OnGameNewmap(callback: (data: GameNewmapEvent) => void): void {
    _subscribe("game_newmap", callback);
}

export function OnGamePhaseChanged(callback: (data: GamePhaseChangedEvent) => void): void {
    _subscribe("game_phase_changed", callback);
}

export function OnHltvCameraman(callback: (data: HltvCameramanEvent) => void): void {
    _subscribe("hltv_cameraman", callback);
}

export function OnHltvChase(callback: (data: HltvChaseEvent) => void): void {
    _subscribe("hltv_chase", callback);
}

export function OnHltvRankCamera(callback: (data: HltvRankCameraEvent) => void): void {
    _subscribe("hltv_rank_camera", callback);
}

export function OnHltvRankEntity(callback: (data: HltvRankEntityEvent) => void): void {
    _subscribe("hltv_rank_entity", callback);
}

export function OnHltvFixed(callback: (data: HltvFixedEvent) => void): void {
    _subscribe("hltv_fixed", callback);
}

export function OnHltvMessage(callback: (data: HltvMessageEvent) => void): void {
    _subscribe("hltv_message", callback);
}

export function OnHltvStatus(callback: (data: HltvStatusEvent) => void): void {
    _subscribe("hltv_status", callback);
}

export function OnHltvTitle(callback: (data: HltvTitleEvent) => void): void {
    _subscribe("hltv_title", callback);
}

export function OnHltvChat(callback: (data: HltvChatEvent) => void): void {
    _subscribe("hltv_chat", callback);
}

export function OnHltvVersioninfo(callback: (data: HltvVersioninfoEvent) => void): void {
    _subscribe("hltv_versioninfo", callback);
}

export function OnHltvReplay(callback: (data: HltvReplayEvent) => void): void {
    _subscribe("hltv_replay", callback);
}

export function OnHltvChangedMode(callback: (data: HltvChangedModeEvent) => void): void {
    _subscribe("hltv_changed_mode", callback);
}

export function OnHltvReplayStatus(callback: (data: HltvReplayStatusEvent) => void): void {
    _subscribe("hltv_replay_status", callback);
}

export function OnDemoStart(callback: (data: DemoStartEvent) => void): void {
    _subscribe("demo_start", callback);
}

export function OnDemoStop(callback: (data: DemoStopEvent) => void): void {
    _subscribe("demo_stop", callback);
}

export function OnDemoSkip(callback: (data: DemoSkipEvent) => void): void {
    _subscribe("demo_skip", callback);
}

export function OnMapShutdown(callback: (data: MapShutdownEvent) => void): void {
    _subscribe("map_shutdown", callback);
}

export function OnMapTransition(callback: (data: MapTransitionEvent) => void): void {
    _subscribe("map_transition", callback);
}

export function OnHostnameChanged(callback: (data: HostnameChangedEvent) => void): void {
    _subscribe("hostname_changed", callback);
}

export function OnDifficultyChanged(callback: (data: DifficultyChangedEvent) => void): void {
    _subscribe("difficulty_changed", callback);
}

/** @deprecated Use `Instance.OnGunFire` instead. For melee weapons use `Instance.OnKnifeAttack` */
export function OnWeaponFire(callback: (data: WeaponFireEvent) => void): void {
    _subscribe("weapon_fire", callback);
}

export function OnWeaponFireOnEmpty(callback: (data: WeaponFireOnEmptyEvent) => void): void {
    _subscribe("weapon_fire_on_empty", callback);
}

export function OnWeaponOutofammo(callback: (data: WeaponOutofammoEvent) => void): void {
    _subscribe("weapon_outofammo", callback);
}

/** @deprecated Use `Instance.OnGunReload` instead. */
export function OnWeaponReload(callback: (data: WeaponReloadEvent) => void): void {
    _subscribe("weapon_reload", callback);
}

export function OnWeaponZoom(callback: (data: WeaponZoomEvent) => void): void {
    _subscribe("weapon_zoom", callback);
}

export function OnWeaponZoomRifle(callback: (data: WeaponZoomRifleEvent) => void): void {
    _subscribe("weapon_zoom_rifle", callback);
}

/** @deprecated Use `Instance.OnGrenadeThrow` instead. */
export function OnGrenadeThrown(callback: (data: GrenadeThrownEvent) => void): void {
    _subscribe("grenade_thrown", callback);
}

/** @deprecated Use `Instance.OnGrenadeBounce` instead. */
export function OnGrenadeBounce(callback: (data: GrenadeBounceEvent) => void): void {
    _subscribe("grenade_bounce", callback);
}

export function OnHegrenadeDetonate(callback: (data: HegrenadeDetonateEvent) => void): void {
    _subscribe("hegrenade_detonate", callback);
}

export function OnFlashbangDetonate(callback: (data: FlashbangDetonateEvent) => void): void {
    _subscribe("flashbang_detonate", callback);
}

export function OnSmokegrenadeDetonate(callback: (data: SmokegrenadeDetonateEvent) => void): void {
    _subscribe("smokegrenade_detonate", callback);
}

export function OnSmokegrenadeExpired(callback: (data: SmokegrenadeExpiredEvent) => void): void {
    _subscribe("smokegrenade_expired", callback);
}

export function OnMolotovDetonate(callback: (data: MolotovDetonateEvent) => void): void {
    _subscribe("molotov_detonate", callback);
}

export function OnDecoyDetonate(callback: (data: DecoyDetonateEvent) => void): void {
    _subscribe("decoy_detonate", callback);
}

export function OnDecoyStarted(callback: (data: DecoyStartedEvent) => void): void {
    _subscribe("decoy_started", callback);
}

export function OnDecoyFiring(callback: (data: DecoyFiringEvent) => void): void {
    _subscribe("decoy_firing", callback);
}

export function OnTagrenadeDetonate(callback: (data: TagrenadeDetonateEvent) => void): void {
    _subscribe("tagrenade_detonate", callback);
}

export function OnInfernoStartburn(callback: (data: InfernoStartburnEvent) => void): void {
    _subscribe("inferno_startburn", callback);
}

export function OnInfernoExpire(callback: (data: InfernoExpireEvent) => void): void {
    _subscribe("inferno_expire", callback);
}

export function OnInfernoExtinguish(callback: (data: InfernoExtinguishEvent) => void): void {
    _subscribe("inferno_extinguish", callback);
}

export function OnBombBeginplant(callback: (data: BombBeginplantEvent) => void): void {
    _subscribe("bomb_beginplant", callback);
}

export function OnBombAbortplant(callback: (data: BombAbortplantEvent) => void): void {
    _subscribe("bomb_abortplant", callback);
}

export function OnBombPlanted(callback: (data: BombPlantedEvent) => void): void {
    _subscribe("bomb_planted", callback);
}

export function OnBombBegindefuse(callback: (data: BombBegindefuseEvent) => void): void {
    _subscribe("bomb_begindefuse", callback);
}

export function OnBombAbortdefuse(callback: (data: BombAbortdefuseEvent) => void): void {
    _subscribe("bomb_abortdefuse", callback);
}

export function OnBombDefused(callback: (data: BombDefusedEvent) => void): void {
    _subscribe("bomb_defused", callback);
}

export function OnBombExploded(callback: (data: BombExplodedEvent) => void): void {
    _subscribe("bomb_exploded", callback);
}

export function OnBombDropped(callback: (data: BombDroppedEvent) => void): void {
    _subscribe("bomb_dropped", callback);
}

export function OnBombPickup(callback: (data: BombPickupEvent) => void): void {
    _subscribe("bomb_pickup", callback);
}

export function OnBombBeep(callback: (data: BombBeepEvent) => void): void {
    _subscribe("bomb_beep", callback);
}

export function OnDefuserDropped(callback: (data: DefuserDroppedEvent) => void): void {
    _subscribe("defuser_dropped", callback);
}

export function OnDefuserPickup(callback: (data: DefuserPickupEvent) => void): void {
    _subscribe("defuser_pickup", callback);
}

export function OnHostageFollows(callback: (data: HostageFollowsEvent) => void): void {
    _subscribe("hostage_follows", callback);
}

export function OnHostageHurt(callback: (data: HostageHurtEvent) => void): void {
    _subscribe("hostage_hurt", callback);
}

export function OnHostageKilled(callback: (data: HostageKilledEvent) => void): void {
    _subscribe("hostage_killed", callback);
}

export function OnHostageRescued(callback: (data: HostageRescuedEvent) => void): void {
    _subscribe("hostage_rescued", callback);
}

export function OnHostageStopsFollowing(callback: (data: HostageStopsFollowingEvent) => void): void {
    _subscribe("hostage_stops_following", callback);
}

export function OnHostageRescuedAll(callback: (data: HostageRescuedAllEvent) => void): void {
    _subscribe("hostage_rescued_all", callback);
}

export function OnHostageCallForHelp(callback: (data: HostageCallForHelpEvent) => void): void {
    _subscribe("hostage_call_for_help", callback);
}

export function OnVipEscaped(callback: (data: VipEscapedEvent) => void): void {
    _subscribe("vip_escaped", callback);
}

export function OnVipKilled(callback: (data: VipKilledEvent) => void): void {
    _subscribe("vip_killed", callback);
}

export function OnItemPurchase(callback: (data: ItemPurchaseEvent) => void): void {
    _subscribe("item_purchase", callback);
}

export function OnItemPickup(callback: (data: ItemPickupEvent) => void): void {
    _subscribe("item_pickup", callback);
}

export function OnItemPickupSlerp(callback: (data: ItemPickupSlerpEvent) => void): void {
    _subscribe("item_pickup_slerp", callback);
}

export function OnItemPickupFailed(callback: (data: ItemPickupFailedEvent) => void): void {
    _subscribe("item_pickup_failed", callback);
}

export function OnItemRemove(callback: (data: ItemRemoveEvent) => void): void {
    _subscribe("item_remove", callback);
}

export function OnItemEquip(callback: (data: ItemEquipEvent) => void): void {
    _subscribe("item_equip", callback);
}

export function OnItemSchemaInitialized(callback: (data: ItemSchemaInitializedEvent) => void): void {
    _subscribe("item_schema_initialized", callback);
}

export function OnAmmoPickup(callback: (data: AmmoPickupEvent) => void): void {
    _subscribe("ammo_pickup", callback);
}

export function OnAmmoRefill(callback: (data: AmmoRefillEvent) => void): void {
    _subscribe("ammo_refill", callback);
}

export function OnEnterBuyzone(callback: (data: EnterBuyzoneEvent) => void): void {
    _subscribe("enter_buyzone", callback);
}

export function OnExitBuyzone(callback: (data: ExitBuyzoneEvent) => void): void {
    _subscribe("exit_buyzone", callback);
}

export function OnEnterBombzone(callback: (data: EnterBombzoneEvent) => void): void {
    _subscribe("enter_bombzone", callback);
}

export function OnExitBombzone(callback: (data: ExitBombzoneEvent) => void): void {
    _subscribe("exit_bombzone", callback);
}

export function OnEnterRescueZone(callback: (data: EnterRescueZoneEvent) => void): void {
    _subscribe("enter_rescue_zone", callback);
}

export function OnExitRescueZone(callback: (data: ExitRescueZoneEvent) => void): void {
    _subscribe("exit_rescue_zone", callback);
}

export function OnBuytimeEnded(callback: (data: BuytimeEndedEvent) => void): void {
    _subscribe("buytime_ended", callback);
}

export function OnSilencerOff(callback: (data: SilencerOffEvent) => void): void {
    _subscribe("silencer_off", callback);
}

export function OnSilencerOn(callback: (data: SilencerOnEvent) => void): void {
    _subscribe("silencer_on", callback);
}

export function OnSilencerDetach(callback: (data: SilencerDetachEvent) => void): void {
    _subscribe("silencer_detach", callback);
}

export function OnBuymenuOpen(callback: (data: BuymenuOpenEvent) => void): void {
    _subscribe("buymenu_open", callback);
}

export function OnBuymenuClose(callback: (data: BuymenuCloseEvent) => void): void {
    _subscribe("buymenu_close", callback);
}

export function OnInspectWeapon(callback: (data: InspectWeaponEvent) => void): void {
    _subscribe("inspect_weapon", callback);
}

export function OnOtherDeath(callback: (data: OtherDeathEvent) => void): void {
    _subscribe("other_death", callback);
}

/** @deprecated Use `Instance.OnBulletImpact` instead. */
export function OnBulletImpact(callback: (data: BulletImpactEvent) => void): void {
    _subscribe("bullet_impact", callback);
}

export function OnBulletFlightResolution(callback: (data: BulletFlightResolutionEvent) => void): void {
    _subscribe("bullet_flight_resolution", callback);
}

export function OnDoorClose(callback: (data: DoorCloseEvent) => void): void {
    _subscribe("door_close", callback);
}

export function OnDoorMoving(callback: (data: DoorMovingEvent) => void): void {
    _subscribe("door_moving", callback);
}

export function OnDoorBreak(callback: (data: DoorBreakEvent) => void): void {
    _subscribe("door_break", callback);
}

export function OnDoorClosed(callback: (data: DoorClosedEvent) => void): void {
    _subscribe("door_closed", callback);
}

export function OnDoorOpen(callback: (data: DoorOpenEvent) => void): void {
    _subscribe("door_open", callback);
}

export function OnBreakBreakable(callback: (data: BreakBreakableEvent) => void): void {
    _subscribe("break_breakable", callback);
}

export function OnBreakProp(callback: (data: BreakPropEvent) => void): void {
    _subscribe("break_prop", callback);
}

export function OnBrokenBreakable(callback: (data: BrokenBreakableEvent) => void): void {
    _subscribe("broken_breakable", callback);
}

export function OnEntityKilled(callback: (data: EntityKilledEvent) => void): void {
    _subscribe("entity_killed", callback);
}

export function OnEntityVisible(callback: (data: EntityVisibleEvent) => void): void {
    _subscribe("entity_visible", callback);
}

export function OnVoteStarted(callback: (data: VoteStartedEvent) => void): void {
    _subscribe("vote_started", callback);
}

export function OnVoteFailed(callback: (data: VoteFailedEvent) => void): void {
    _subscribe("vote_failed", callback);
}

export function OnVotePassed(callback: (data: VotePassedEvent) => void): void {
    _subscribe("vote_passed", callback);
}

export function OnVoteChanged(callback: (data: VoteChangedEvent) => void): void {
    _subscribe("vote_changed", callback);
}

export function OnVoteCastYes(callback: (data: VoteCastYesEvent) => void): void {
    _subscribe("vote_cast_yes", callback);
}

export function OnVoteCastNo(callback: (data: VoteCastNoEvent) => void): void {
    _subscribe("vote_cast_no", callback);
}

export function OnVoteCast(callback: (data: VoteCastEvent) => void): void {
    _subscribe("vote_cast", callback);
}

export function OnVoteEnded(callback: (data: VoteEndedEvent) => void): void {
    _subscribe("vote_ended", callback);
}

export function OnVoteOptions(callback: (data: VoteOptionsEvent) => void): void {
    _subscribe("vote_options", callback);
}

export function OnStartVote(callback: (data: StartVoteEvent) => void): void {
    _subscribe("start_vote", callback);
}

export function OnEnableRestartVoting(callback: (data: EnableRestartVotingEvent) => void): void {
    _subscribe("enable_restart_voting", callback);
}

export function OnAchievementEvent(callback: (data: AchievementEventEvent) => void): void {
    _subscribe("achievement_event", callback);
}

export function OnAchievementEarned(callback: (data: AchievementEarnedEvent) => void): void {
    _subscribe("achievement_earned", callback);
}

export function OnAchievementEarnedLocal(callback: (data: AchievementEarnedLocalEvent) => void): void {
    _subscribe("achievement_earned_local", callback);
}

export function OnAchievementWriteFailed(callback: (data: AchievementWriteFailedEvent) => void): void {
    _subscribe("achievement_write_failed", callback);
}

export function OnAchievementInfoLoaded(callback: (data: AchievementInfoLoadedEvent) => void): void {
    _subscribe("achievement_info_loaded", callback);
}

export function OnBonusUpdated(callback: (data: BonusUpdatedEvent) => void): void {
    _subscribe("bonus_updated", callback);
}

export function OnSpecTargetUpdated(callback: (data: SpecTargetUpdatedEvent) => void): void {
    _subscribe("spec_target_updated", callback);
}

export function OnSpecModeUpdated(callback: (data: SpecModeUpdatedEvent) => void): void {
    _subscribe("spec_mode_updated", callback);
}

export function OnGameinstructorDraw(callback: (data: GameinstructorDrawEvent) => void): void {
    _subscribe("gameinstructor_draw", callback);
}

export function OnGameinstructorNodraw(callback: (data: GameinstructorNodrawEvent) => void): void {
    _subscribe("gameinstructor_nodraw", callback);
}

export function OnInstructorStartLesson(callback: (data: InstructorStartLessonEvent) => void): void {
    _subscribe("instructor_start_lesson", callback);
}

export function OnInstructorCloseLesson(callback: (data: InstructorCloseLessonEvent) => void): void {
    _subscribe("instructor_close_lesson", callback);
}

export function OnInstructorServerHintCreate(callback: (data: InstructorServerHintCreateEvent) => void): void {
    _subscribe("instructor_server_hint_create", callback);
}

export function OnInstructorServerHintStop(callback: (data: InstructorServerHintStopEvent) => void): void {
    _subscribe("instructor_server_hint_stop", callback);
}

export function OnClientsideLessonClosed(callback: (data: ClientsideLessonClosedEvent) => void): void {
    _subscribe("clientside_lesson_closed", callback);
}

export function OnSetInstructorGroupEnabled(callback: (data: SetInstructorGroupEnabledEvent) => void): void {
    _subscribe("set_instructor_group_enabled", callback);
}

export function OnPhysgunPickup(callback: (data: PhysgunPickupEvent) => void): void {
    _subscribe("physgun_pickup", callback);
}

export function OnFlareIgniteNpc(callback: (data: FlareIgniteNpcEvent) => void): void {
    _subscribe("flare_ignite_npc", callback);
}

export function OnHelicopterGrenadePuntMiss(callback: (data: HelicopterGrenadePuntMissEvent) => void): void {
    _subscribe("helicopter_grenade_punt_miss", callback);
}

export function OnFinaleStart(callback: (data: FinaleStartEvent) => void): void {
    _subscribe("finale_start", callback);
}

export function OnUserDataDownloaded(callback: (data: UserDataDownloadedEvent) => void): void {
    _subscribe("user_data_downloaded", callback);
}

export function OnReadGameTitledata(callback: (data: ReadGameTitledataEvent) => void): void {
    _subscribe("read_game_titledata", callback);
}

export function OnWriteGameTitledata(callback: (data: WriteGameTitledataEvent) => void): void {
    _subscribe("write_game_titledata", callback);
}

export function OnResetGameTitledata(callback: (data: ResetGameTitledataEvent) => void): void {
    _subscribe("reset_game_titledata", callback);
}

export function OnWriteProfileData(callback: (data: WriteProfileDataEvent) => void): void {
    _subscribe("write_profile_data", callback);
}

export function OnRagdollDissolved(callback: (data: RagdollDissolvedEvent) => void): void {
    _subscribe("ragdoll_dissolved", callback);
}

export function OnInventoryUpdated(callback: (data: InventoryUpdatedEvent) => void): void {
    _subscribe("inventory_updated", callback);
}

export function OnCartUpdated(callback: (data: CartUpdatedEvent) => void): void {
    _subscribe("cart_updated", callback);
}

export function OnStorePricesheetUpdated(callback: (data: StorePricesheetUpdatedEvent) => void): void {
    _subscribe("store_pricesheet_updated", callback);
}

export function OnDropRateModified(callback: (data: DropRateModifiedEvent) => void): void {
    _subscribe("drop_rate_modified", callback);
}

export function OnEventTicketModified(callback: (data: EventTicketModifiedEvent) => void): void {
    _subscribe("event_ticket_modified", callback);
}

export function OnGcConnected(callback: (data: GcConnectedEvent) => void): void {
    _subscribe("gc_connected", callback);
}

export function OnDynamicShadowLightChanged(callback: (data: DynamicShadowLightChangedEvent) => void): void {
    _subscribe("dynamic_shadow_light_changed", callback);
}

export function OnGameuiHidden(callback: (data: GameuiHiddenEvent) => void): void {
    _subscribe("gameui_hidden", callback);
}

export function OnItemsGifted(callback: (data: ItemsGiftedEvent) => void): void {
    _subscribe("items_gifted", callback);
}

export function OnWarmupEnd(callback: (data: WarmupEndEvent) => void): void {
    _subscribe("warmup_end", callback);
}

export function OnAnnouncePhaseEnd(callback: (data: AnnouncePhaseEndEvent) => void): void {
    _subscribe("announce_phase_end", callback);
}

export function OnCsIntermission(callback: (data: CsIntermissionEvent) => void): void {
    _subscribe("cs_intermission", callback);
}

export function OnCsGameDisconnected(callback: (data: CsGameDisconnectedEvent) => void): void {
    _subscribe("cs_game_disconnected", callback);
}

export function OnCsRoundFinalBeep(callback: (data: CsRoundFinalBeepEvent) => void): void {
    _subscribe("cs_round_final_beep", callback);
}

export function OnCsRoundStartBeep(callback: (data: CsRoundStartBeepEvent) => void): void {
    _subscribe("cs_round_start_beep", callback);
}

export function OnCsWinPanelRound(callback: (data: CsWinPanelRoundEvent) => void): void {
    _subscribe("cs_win_panel_round", callback);
}

export function OnCsWinPanelMatch(callback: (data: CsWinPanelMatchEvent) => void): void {
    _subscribe("cs_win_panel_match", callback);
}

export function OnCsMatchEndRestart(callback: (data: CsMatchEndRestartEvent) => void): void {
    _subscribe("cs_match_end_restart", callback);
}

export function OnCsPreRestart(callback: (data: CsPreRestartEvent) => void): void {
    _subscribe("cs_pre_restart", callback);
}

export function OnCsPrevNextSpectator(callback: (data: CsPrevNextSpectatorEvent) => void): void {
    _subscribe("cs_prev_next_spectator", callback);
}

export function OnShowDeathpanel(callback: (data: ShowDeathpanelEvent) => void): void {
    _subscribe("show_deathpanel", callback);
}

export function OnHideDeathpanel(callback: (data: HideDeathpanelEvent) => void): void {
    _subscribe("hide_deathpanel", callback);
}

export function OnUgcMapInfoReceived(callback: (data: UgcMapInfoReceivedEvent) => void): void {
    _subscribe("ugc_map_info_received", callback);
}

export function OnUgcMapUnsubscribed(callback: (data: UgcMapUnsubscribedEvent) => void): void {
    _subscribe("ugc_map_unsubscribed", callback);
}

export function OnUgcMapDownloadError(callback: (data: UgcMapDownloadErrorEvent) => void): void {
    _subscribe("ugc_map_download_error", callback);
}

export function OnUgcFileDownloadFinished(callback: (data: UgcFileDownloadFinishedEvent) => void): void {
    _subscribe("ugc_file_download_finished", callback);
}

export function OnUgcFileDownloadStart(callback: (data: UgcFileDownloadStartEvent) => void): void {
    _subscribe("ugc_file_download_start", callback);
}

export function OnBeginNewMatch(callback: (data: BeginNewMatchEvent) => void): void {
    _subscribe("begin_new_match", callback);
}

export function OnMatchEndConditions(callback: (data: MatchEndConditionsEvent) => void): void {
    _subscribe("match_end_conditions", callback);
}

export function OnEndmatchMapvoteSelectingMap(callback: (data: EndmatchMapvoteSelectingMapEvent) => void): void {
    _subscribe("endmatch_mapvote_selecting_map", callback);
}

export function OnEndmatchCmmStartRevealItems(callback: (data: EndmatchCmmStartRevealItemsEvent) => void): void {
    _subscribe("endmatch_cmm_start_reveal_items", callback);
}

export function OnNextlevelChanged(callback: (data: NextlevelChangedEvent) => void): void {
    _subscribe("nextlevel_changed", callback);
}

export function OnDmBonusWeaponStart(callback: (data: DmBonusWeaponStartEvent) => void): void {
    _subscribe("dm_bonus_weapon_start", callback);
}

export function OnGgKilledEnemy(callback: (data: GgKilledEnemyEvent) => void): void {
    _subscribe("gg_killed_enemy", callback);
}

export function OnSwitchTeam(callback: (data: SwitchTeamEvent) => void): void {
    _subscribe("switch_team", callback);
}

export function OnTrialTimeExpired(callback: (data: TrialTimeExpiredEvent) => void): void {
    _subscribe("trial_time_expired", callback);
}

export function OnUpdateMatchmakingStats(callback: (data: UpdateMatchmakingStatsEvent) => void): void {
    _subscribe("update_matchmaking_stats", callback);
}

export function OnClientDisconnect(callback: (data: ClientDisconnectEvent) => void): void {
    _subscribe("client_disconnect", callback);
}

export function OnClientLoadoutChanged(callback: (data: ClientLoadoutChangedEvent) => void): void {
    _subscribe("client_loadout_changed", callback);
}

export function OnAddPlayerSonarIcon(callback: (data: AddPlayerSonarIconEvent) => void): void {
    _subscribe("add_player_sonar_icon", callback);
}

export function OnAddBulletHitMarker(callback: (data: AddBulletHitMarkerEvent) => void): void {
    _subscribe("add_bullet_hit_marker", callback);
}

export function OnSfuievent(callback: (data: SfuieventEvent) => void): void {
    _subscribe("sfuievent", callback);
}

export function OnWeaponhudSelection(callback: (data: WeaponhudSelectionEvent) => void): void {
    _subscribe("weaponhud_selection", callback);
}

export function OnTrPlayerFlashbanged(callback: (data: TrPlayerFlashbangedEvent) => void): void {
    _subscribe("tr_player_flashbanged", callback);
}

export function OnTrMarkComplete(callback: (data: TrMarkCompleteEvent) => void): void {
    _subscribe("tr_mark_complete", callback);
}

export function OnTrMarkBestTime(callback: (data: TrMarkBestTimeEvent) => void): void {
    _subscribe("tr_mark_best_time", callback);
}

export function OnTrExitHintTrigger(callback: (data: TrExitHintTriggerEvent) => void): void {
    _subscribe("tr_exit_hint_trigger", callback);
}

export function OnTrShowFinishMsgbox(callback: (data: TrShowFinishMsgboxEvent) => void): void {
    _subscribe("tr_show_finish_msgbox", callback);
}

export function OnTrShowExitMsgbox(callback: (data: TrShowExitMsgboxEvent) => void): void {
    _subscribe("tr_show_exit_msgbox", callback);
}

export function OnBotTakeover(callback: (data: BotTakeoverEvent) => void): void {
    _subscribe("bot_takeover", callback);
}

export function OnJointeamFailed(callback: (data: JointeamFailedEvent) => void): void {
    _subscribe("jointeam_failed", callback);
}

export function OnTeamchangePending(callback: (data: TeamchangePendingEvent) => void): void {
    _subscribe("teamchange_pending", callback);
}

export function OnMaterialDefaultComplete(callback: (data: MaterialDefaultCompleteEvent) => void): void {
    _subscribe("material_default_complete", callback);
}

export function OnSeasoncoinLevelup(callback: (data: SeasoncoinLevelupEvent) => void): void {
    _subscribe("seasoncoin_levelup", callback);
}

export function OnTournamentReward(callback: (data: TournamentRewardEvent) => void): void {
    _subscribe("tournament_reward", callback);
}

export function OnStartHalftime(callback: (data: StartHalftimeEvent) => void): void {
    _subscribe("start_halftime", callback);
}

export function OnPlayerDecal(callback: (data: PlayerDecalEvent) => void): void {
    _subscribe("player_decal", callback);
}

export function OnSurvivalAnnouncePhase(callback: (data: SurvivalAnnouncePhaseEvent) => void): void {
    _subscribe("survival_announce_phase", callback);
}

export function OnParachutePickup(callback: (data: ParachutePickupEvent) => void): void {
    _subscribe("parachute_pickup", callback);
}

export function OnParachuteDeploy(callback: (data: ParachuteDeployEvent) => void): void {
    _subscribe("parachute_deploy", callback);
}

export function OnDronegunAttack(callback: (data: DronegunAttackEvent) => void): void {
    _subscribe("dronegun_attack", callback);
}

export function OnDroneDispatched(callback: (data: DroneDispatchedEvent) => void): void {
    _subscribe("drone_dispatched", callback);
}

export function OnLootCrateVisible(callback: (data: LootCrateVisibleEvent) => void): void {
    _subscribe("loot_crate_visible", callback);
}

export function OnLootCrateOpened(callback: (data: LootCrateOpenedEvent) => void): void {
    _subscribe("loot_crate_opened", callback);
}

export function OnOpenCrateInstr(callback: (data: OpenCrateInstrEvent) => void): void {
    _subscribe("open_crate_instr", callback);
}

export function OnSmokeBeaconParadrop(callback: (data: SmokeBeaconParadropEvent) => void): void {
    _subscribe("smoke_beacon_paradrop", callback);
}

export function OnSurvivalParadropSpawn(callback: (data: SurvivalParadropSpawnEvent) => void): void {
    _subscribe("survival_paradrop_spawn", callback);
}

export function OnSurvivalParadropBreak(callback: (data: SurvivalParadropBreakEvent) => void): void {
    _subscribe("survival_paradrop_break", callback);
}

export function OnDroneCargoDetached(callback: (data: DroneCargoDetachedEvent) => void): void {
    _subscribe("drone_cargo_detached", callback);
}

export function OnDroneAboveRoof(callback: (data: DroneAboveRoofEvent) => void): void {
    _subscribe("drone_above_roof", callback);
}

export function OnChoppersIncomingWarning(callback: (data: ChoppersIncomingWarningEvent) => void): void {
    _subscribe("choppers_incoming_warning", callback);
}

export function OnFirstbombsIncomingWarning(callback: (data: FirstbombsIncomingWarningEvent) => void): void {
    _subscribe("firstbombs_incoming_warning", callback);
}

export function OnDzItemInteraction(callback: (data: DzItemInteractionEvent) => void): void {
    _subscribe("dz_item_interaction", callback);
}

export function OnSurvivalTeammateRespawn(callback: (data: SurvivalTeammateRespawnEvent) => void): void {
    _subscribe("survival_teammate_respawn", callback);
}

export function OnSurvivalNoRespawnsWarning(callback: (data: SurvivalNoRespawnsWarningEvent) => void): void {
    _subscribe("survival_no_respawns_warning", callback);
}

export function OnSurvivalNoRespawnsFinal(callback: (data: SurvivalNoRespawnsFinalEvent) => void): void {
    _subscribe("survival_no_respawns_final", callback);
}

export function OnShowSurvivalRespawnStatus(callback: (data: ShowSurvivalRespawnStatusEvent) => void): void {
    _subscribe("show_survival_respawn_status", callback);
}

export function OnGuardianWaveRestart(callback: (data: GuardianWaveRestartEvent) => void): void {
    _subscribe("guardian_wave_restart", callback);
}

export function OnNavBlocked(callback: (data: NavBlockedEvent) => void): void {
    _subscribe("nav_blocked", callback);
}

export function OnNavGenerate(callback: (data: NavGenerateEvent) => void): void {
    _subscribe("nav_generate", callback);
}

export function OnRepostXboxAchievements(callback: (data: RepostXboxAchievementsEvent) => void): void {
    _subscribe("repost_xbox_achievements", callback);
}

export function OnMbInputLockSuccess(callback: (data: MbInputLockSuccessEvent) => void): void {
    _subscribe("mb_input_lock_success", callback);
}

export function OnMbInputLockCancel(callback: (data: MbInputLockCancelEvent) => void): void {
    _subscribe("mb_input_lock_cancel", callback);
}