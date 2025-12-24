import { Instance } from 'cs_script/point_script';

// example usage:
/*
EventListeners.RegisterAll();

EventListeners.OnPlayerHurt((data) => {
    css.Msg(`player ${css.GetPlayerController(data.userid)?.GetPlayerName()} was hit by ${css.GetPlayerController(data.attacker)?.GetPlayerName()} for -${data.dmg_health} HP and -${data.dmg_armor} amor`);
});
*/

class EventListeners {
    static registered = false;
    static handlers = new Map();
    static RegisterAll() {
        if (this.registered) {
            Instance.Msg("event listeners already registered");
            return;
        }
        const eventListeners = Instance.FindEntitiesByClass("logic_eventlistener");
        eventListeners.forEach(listener => {
            const eventName = listener.GetEntityName();
            Instance.ConnectOutput(listener, "OnEventFired", (data) => {
                this.TriggerEvent(eventName, data);
            });
        });
        this.registered = true;
        Instance.Msg(`registered ${eventListeners.length} event listeners`);
    }
    static TriggerEvent(eventName, data) {
        const handlers = this.handlers.get(eventName);
        if (handlers) {
            handlers.forEach(handler => handler(data));
        }
    }
    static On(eventName, callback) {
        if (!this.handlers.has(eventName)) {
            this.handlers.set(eventName, []);
        }
        this.handlers.get(eventName).push(callback);
    }
    static OnServerSpawn(callback) {
        this.On("server_spawn", callback);
    }
    static OnServerPreShutdown(callback) {
        this.On("server_pre_shutdown", callback);
    }
    static OnServerShutdown(callback) {
        this.On("server_shutdown", callback);
    }
    static OnServerMessage(callback) {
        this.On("server_message", callback);
    }
    static OnServerCvar(callback) {
        this.On("server_cvar", callback);
    }
    static OnPlayerActivate(callback) {
        this.On("player_activate", callback);
    }
    static OnPlayerConnectFull(callback) {
        this.On("player_connect_full", callback);
    }
    static OnPlayerFullUpdate(callback) {
        this.On("player_full_update", callback);
    }
    static OnPlayerConnect(callback) {
        this.On("player_connect", callback);
    }
    static OnPlayerDisconnect(callback) {
        this.On("player_disconnect", callback);
    }
    static OnPlayerInfo(callback) {
        this.On("player_info", callback);
    }
    static OnPlayerSpawn(callback) {
        this.On("player_spawn", callback);
    }
    static OnPlayerTeam(callback) {
        this.On("player_team", callback);
    }
    static OnLocalPlayerTeam(callback) {
        this.On("local_player_team", callback);
    }
    static OnLocalPlayerControllerTeam(callback) {
        this.On("local_player_controller_team", callback);
    }
    static OnPlayerChangename(callback) {
        this.On("player_changename", callback);
    }
    static OnPlayerHurt(callback) {
        this.On("player_hurt", callback);
    }
    static OnPlayerChat(callback) {
        this.On("player_chat", callback);
    }
    static OnLocalPlayerPawnChanged(callback) {
        this.On("local_player_pawn_changed", callback);
    }
    static OnPlayerStatsUpdated(callback) {
        this.On("player_stats_updated", callback);
    }
    static OnPlayerDeath(callback) {
        this.On("player_death", callback);
    }
    static OnPlayerFootstep(callback) {
        this.On("player_footstep", callback);
    }
    static OnPlayerHintmessage(callback) {
        this.On("player_hintmessage", callback);
    }
    static OnPlayerSpawned(callback) {
        this.On("player_spawned", callback);
    }
    static OnPlayerJump(callback) {
        this.On("player_jump", callback);
    }
    static OnPlayerBlind(callback) {
        this.On("player_blind", callback);
    }
    static OnPlayerFalldamage(callback) {
        this.On("player_falldamage", callback);
    }
    static OnPlayerScore(callback) {
        this.On("player_score", callback);
    }
    static OnPlayerShoot(callback) {
        this.On("player_shoot", callback);
    }
    static OnPlayerRadio(callback) {
        this.On("player_radio", callback);
    }
    static OnPlayerAvengedTeammate(callback) {
        this.On("player_avenged_teammate", callback);
    }
    static OnPlayerResetVote(callback) {
        this.On("player_reset_vote", callback);
    }
    static OnPlayerGivenC4(callback) {
        this.On("player_given_c4", callback);
    }
    static OnPlayerPing(callback) {
        this.On("player_ping", callback);
    }
    static OnPlayerPingStop(callback) {
        this.On("player_ping_stop", callback);
    }
    static OnPlayerSound(callback) {
        this.On("player_sound", callback);
    }
    static OnTeamplayBroadcastAudio(callback) {
        this.On("teamplay_broadcast_audio", callback);
    }
    static OnTeamInfo(callback) {
        this.On("team_info", callback);
    }
    static OnTeamScore(callback) {
        this.On("team_score", callback);
    }
    static OnTeamplayRoundStart(callback) {
        this.On("teamplay_round_start", callback);
    }
    static OnTeamIntroStart(callback) {
        this.On("team_intro_start", callback);
    }
    static OnTeamIntroEnd(callback) {
        this.On("team_intro_end", callback);
    }
    static OnRoundStart(callback) {
        this.On("round_start", callback);
    }
    static OnRoundEnd(callback) {
        this.On("round_end", callback);
    }
    static OnRoundStartPreEntity(callback) {
        this.On("round_start_pre_entity", callback);
    }
    static OnRoundStartPostNav(callback) {
        this.On("round_start_post_nav", callback);
    }
    static OnRoundFreezeEnd(callback) {
        this.On("round_freeze_end", callback);
    }
    static OnRoundPrestart(callback) {
        this.On("round_prestart", callback);
    }
    static OnRoundPoststart(callback) {
        this.On("round_poststart", callback);
    }
    static OnRoundAnnounceMatchPoint(callback) {
        this.On("round_announce_match_point", callback);
    }
    static OnRoundAnnounceFinal(callback) {
        this.On("round_announce_final", callback);
    }
    static OnRoundAnnounceLastRoundHalf(callback) {
        this.On("round_announce_last_round_half", callback);
    }
    static OnRoundAnnounceMatchStart(callback) {
        this.On("round_announce_match_start", callback);
    }
    static OnRoundAnnounceWarmup(callback) {
        this.On("round_announce_warmup", callback);
    }
    static OnRoundEndUploadStats(callback) {
        this.On("round_end_upload_stats", callback);
    }
    static OnRoundOfficiallyEnded(callback) {
        this.On("round_officially_ended", callback);
    }
    static OnRoundTimeWarning(callback) {
        this.On("round_time_warning", callback);
    }
    static OnRoundMvp(callback) {
        this.On("round_mvp", callback);
    }
    static OnGameInit(callback) {
        this.On("game_init", callback);
    }
    static OnGameStart(callback) {
        this.On("game_start", callback);
    }
    static OnGameEnd(callback) {
        this.On("game_end", callback);
    }
    static OnGameMessage(callback) {
        this.On("game_message", callback);
    }
    static OnGameNewmap(callback) {
        this.On("game_newmap", callback);
    }
    static OnGamePhaseChanged(callback) {
        this.On("game_phase_changed", callback);
    }
    static OnHltvCameraman(callback) {
        this.On("hltv_cameraman", callback);
    }
    static OnHltvChase(callback) {
        this.On("hltv_chase", callback);
    }
    static OnHltvRankCamera(callback) {
        this.On("hltv_rank_camera", callback);
    }
    static OnHltvRankEntity(callback) {
        this.On("hltv_rank_entity", callback);
    }
    static OnHltvFixed(callback) {
        this.On("hltv_fixed", callback);
    }
    static OnHltvMessage(callback) {
        this.On("hltv_message", callback);
    }
    static OnHltvStatus(callback) {
        this.On("hltv_status", callback);
    }
    static OnHltvTitle(callback) {
        this.On("hltv_title", callback);
    }
    static OnHltvChat(callback) {
        this.On("hltv_chat", callback);
    }
    static OnHltvVersioninfo(callback) {
        this.On("hltv_versioninfo", callback);
    }
    static OnHltvReplay(callback) {
        this.On("hltv_replay", callback);
    }
    static OnHltvChangedMode(callback) {
        this.On("hltv_changed_mode", callback);
    }
    static OnHltvReplayStatus(callback) {
        this.On("hltv_replay_status", callback);
    }
    static OnDemoStart(callback) {
        this.On("demo_start", callback);
    }
    static OnDemoStop(callback) {
        this.On("demo_stop", callback);
    }
    static OnDemoSkip(callback) {
        this.On("demo_skip", callback);
    }
    static OnMapShutdown(callback) {
        this.On("map_shutdown", callback);
    }
    static OnMapTransition(callback) {
        this.On("map_transition", callback);
    }
    static OnHostnameChanged(callback) {
        this.On("hostname_changed", callback);
    }
    static OnDifficultyChanged(callback) {
        this.On("difficulty_changed", callback);
    }
    static OnWeaponFire(callback) {
        this.On("weapon_fire", callback);
    }
    static OnWeaponFireOnEmpty(callback) {
        this.On("weapon_fire_on_empty", callback);
    }
    static OnWeaponOutofammo(callback) {
        this.On("weapon_outofammo", callback);
    }
    static OnWeaponReload(callback) {
        this.On("weapon_reload", callback);
    }
    static OnWeaponZoom(callback) {
        this.On("weapon_zoom", callback);
    }
    static OnWeaponZoomRifle(callback) {
        this.On("weapon_zoom_rifle", callback);
    }
    static OnGrenadeThrown(callback) {
        this.On("grenade_thrown", callback);
    }
    static OnGrenadeBounce(callback) {
        this.On("grenade_bounce", callback);
    }
    static OnHegrenadeDetonate(callback) {
        this.On("hegrenade_detonate", callback);
    }
    static OnFlashbangDetonate(callback) {
        this.On("flashbang_detonate", callback);
    }
    static OnSmokegrenadeDetonate(callback) {
        this.On("smokegrenade_detonate", callback);
    }
    static OnSmokegrenadeExpired(callback) {
        this.On("smokegrenade_expired", callback);
    }
    static OnMolotovDetonate(callback) {
        this.On("molotov_detonate", callback);
    }
    static OnDecoyDetonate(callback) {
        this.On("decoy_detonate", callback);
    }
    static OnDecoyStarted(callback) {
        this.On("decoy_started", callback);
    }
    static OnDecoyFiring(callback) {
        this.On("decoy_firing", callback);
    }
    static OnTagrenadeDetonate(callback) {
        this.On("tagrenade_detonate", callback);
    }
    static OnInfernoStartburn(callback) {
        this.On("inferno_startburn", callback);
    }
    static OnInfernoExpire(callback) {
        this.On("inferno_expire", callback);
    }
    static OnInfernoExtinguish(callback) {
        this.On("inferno_extinguish", callback);
    }
    static OnBombBeginplant(callback) {
        this.On("bomb_beginplant", callback);
    }
    static OnBombAbortplant(callback) {
        this.On("bomb_abortplant", callback);
    }
    static OnBombPlanted(callback) {
        this.On("bomb_planted", callback);
    }
    static OnBombBegindefuse(callback) {
        this.On("bomb_begindefuse", callback);
    }
    static OnBombAbortdefuse(callback) {
        this.On("bomb_abortdefuse", callback);
    }
    static OnBombDefused(callback) {
        this.On("bomb_defused", callback);
    }
    static OnBombExploded(callback) {
        this.On("bomb_exploded", callback);
    }
    static OnBombDropped(callback) {
        this.On("bomb_dropped", callback);
    }
    static OnBombPickup(callback) {
        this.On("bomb_pickup", callback);
    }
    static OnBombBeep(callback) {
        this.On("bomb_beep", callback);
    }
    static OnDefuserDropped(callback) {
        this.On("defuser_dropped", callback);
    }
    static OnDefuserPickup(callback) {
        this.On("defuser_pickup", callback);
    }
    static OnHostageFollows(callback) {
        this.On("hostage_follows", callback);
    }
    static OnHostageHurt(callback) {
        this.On("hostage_hurt", callback);
    }
    static OnHostageKilled(callback) {
        this.On("hostage_killed", callback);
    }
    static OnHostageRescued(callback) {
        this.On("hostage_rescued", callback);
    }
    static OnHostageStopsFollowing(callback) {
        this.On("hostage_stops_following", callback);
    }
    static OnHostageRescuedAll(callback) {
        this.On("hostage_rescued_all", callback);
    }
    static OnHostageCallForHelp(callback) {
        this.On("hostage_call_for_help", callback);
    }
    static OnVipEscaped(callback) {
        this.On("vip_escaped", callback);
    }
    static OnVipKilled(callback) {
        this.On("vip_killed", callback);
    }
    static OnItemPurchase(callback) {
        this.On("item_purchase", callback);
    }
    static OnItemPickup(callback) {
        this.On("item_pickup", callback);
    }
    static OnItemPickupSlerp(callback) {
        this.On("item_pickup_slerp", callback);
    }
    static OnItemPickupFailed(callback) {
        this.On("item_pickup_failed", callback);
    }
    static OnItemRemove(callback) {
        this.On("item_remove", callback);
    }
    static OnItemEquip(callback) {
        this.On("item_equip", callback);
    }
    static OnItemSchemaInitialized(callback) {
        this.On("item_schema_initialized", callback);
    }
    static OnAmmoPickup(callback) {
        this.On("ammo_pickup", callback);
    }
    static OnAmmoRefill(callback) {
        this.On("ammo_refill", callback);
    }
    static OnEnterBuyzone(callback) {
        this.On("enter_buyzone", callback);
    }
    static OnExitBuyzone(callback) {
        this.On("exit_buyzone", callback);
    }
    static OnEnterBombzone(callback) {
        this.On("enter_bombzone", callback);
    }
    static OnExitBombzone(callback) {
        this.On("exit_bombzone", callback);
    }
    static OnEnterRescueZone(callback) {
        this.On("enter_rescue_zone", callback);
    }
    static OnExitRescueZone(callback) {
        this.On("exit_rescue_zone", callback);
    }
    static OnBuytimeEnded(callback) {
        this.On("buytime_ended", callback);
    }
    static OnSilencerOff(callback) {
        this.On("silencer_off", callback);
    }
    static OnSilencerOn(callback) {
        this.On("silencer_on", callback);
    }
    static OnSilencerDetach(callback) {
        this.On("silencer_detach", callback);
    }
    static OnBuymenuOpen(callback) {
        this.On("buymenu_open", callback);
    }
    static OnBuymenuClose(callback) {
        this.On("buymenu_close", callback);
    }
    static OnInspectWeapon(callback) {
        this.On("inspect_weapon", callback);
    }
    static OnOtherDeath(callback) {
        this.On("other_death", callback);
    }
    static OnBulletImpact(callback) {
        this.On("bullet_impact", callback);
    }
    static OnBulletFlightResolution(callback) {
        this.On("bullet_flight_resolution", callback);
    }
    static OnDoorClose(callback) {
        this.On("door_close", callback);
    }
    static OnDoorMoving(callback) {
        this.On("door_moving", callback);
    }
    static OnDoorBreak(callback) {
        this.On("door_break", callback);
    }
    static OnDoorClosed(callback) {
        this.On("door_closed", callback);
    }
    static OnDoorOpen(callback) {
        this.On("door_open", callback);
    }
    static OnBreakBreakable(callback) {
        this.On("break_breakable", callback);
    }
    static OnBreakProp(callback) {
        this.On("break_prop", callback);
    }
    static OnBrokenBreakable(callback) {
        this.On("broken_breakable", callback);
    }
    static OnEntityKilled(callback) {
        this.On("entity_killed", callback);
    }
    static OnEntityVisible(callback) {
        this.On("entity_visible", callback);
    }
    static OnVoteStarted(callback) {
        this.On("vote_started", callback);
    }
    static OnVoteFailed(callback) {
        this.On("vote_failed", callback);
    }
    static OnVotePassed(callback) {
        this.On("vote_passed", callback);
    }
    static OnVoteChanged(callback) {
        this.On("vote_changed", callback);
    }
    static OnVoteCastYes(callback) {
        this.On("vote_cast_yes", callback);
    }
    static OnVoteCastNo(callback) {
        this.On("vote_cast_no", callback);
    }
    static OnVoteCast(callback) {
        this.On("vote_cast", callback);
    }
    static OnVoteEnded(callback) {
        this.On("vote_ended", callback);
    }
    static OnVoteOptions(callback) {
        this.On("vote_options", callback);
    }
    static OnStartVote(callback) {
        this.On("start_vote", callback);
    }
    static OnEnableRestartVoting(callback) {
        this.On("enable_restart_voting", callback);
    }
    static OnAchievementEvent(callback) {
        this.On("achievement_event", callback);
    }
    static OnAchievementEarned(callback) {
        this.On("achievement_earned", callback);
    }
    static OnAchievementEarnedLocal(callback) {
        this.On("achievement_earned_local", callback);
    }
    static OnAchievementWriteFailed(callback) {
        this.On("achievement_write_failed", callback);
    }
    static OnAchievementInfoLoaded(callback) {
        this.On("achievement_info_loaded", callback);
    }
    static OnBonusUpdated(callback) {
        this.On("bonus_updated", callback);
    }
    static OnSpecTargetUpdated(callback) {
        this.On("spec_target_updated", callback);
    }
    static OnSpecModeUpdated(callback) {
        this.On("spec_mode_updated", callback);
    }
    static OnGameinstructorDraw(callback) {
        this.On("gameinstructor_draw", callback);
    }
    static OnGameinstructorNodraw(callback) {
        this.On("gameinstructor_nodraw", callback);
    }
    static OnInstructorStartLesson(callback) {
        this.On("instructor_start_lesson", callback);
    }
    static OnInstructorCloseLesson(callback) {
        this.On("instructor_close_lesson", callback);
    }
    static OnInstructorServerHintCreate(callback) {
        this.On("instructor_server_hint_create", callback);
    }
    static OnInstructorServerHintStop(callback) {
        this.On("instructor_server_hint_stop", callback);
    }
    static OnClientsideLessonClosed(callback) {
        this.On("clientside_lesson_closed", callback);
    }
    static OnSetInstructorGroupEnabled(callback) {
        this.On("set_instructor_group_enabled", callback);
    }
    static OnPhysgunPickup(callback) {
        this.On("physgun_pickup", callback);
    }
    static OnFlareIgniteNpc(callback) {
        this.On("flare_ignite_npc", callback);
    }
    static OnHelicopterGrenadePuntMiss(callback) {
        this.On("helicopter_grenade_punt_miss", callback);
    }
    static OnFinaleStart(callback) {
        this.On("finale_start", callback);
    }
    static OnUserDataDownloaded(callback) {
        this.On("user_data_downloaded", callback);
    }
    static OnReadGameTitledata(callback) {
        this.On("read_game_titledata", callback);
    }
    static OnWriteGameTitledata(callback) {
        this.On("write_game_titledata", callback);
    }
    static OnResetGameTitledata(callback) {
        this.On("reset_game_titledata", callback);
    }
    static OnWriteProfileData(callback) {
        this.On("write_profile_data", callback);
    }
    static OnRagdollDissolved(callback) {
        this.On("ragdoll_dissolved", callback);
    }
    static OnInventoryUpdated(callback) {
        this.On("inventory_updated", callback);
    }
    static OnCartUpdated(callback) {
        this.On("cart_updated", callback);
    }
    static OnStorePricesheetUpdated(callback) {
        this.On("store_pricesheet_updated", callback);
    }
    static OnDropRateModified(callback) {
        this.On("drop_rate_modified", callback);
    }
    static OnEventTicketModified(callback) {
        this.On("event_ticket_modified", callback);
    }
    static OnGcConnected(callback) {
        this.On("gc_connected", callback);
    }
    static OnDynamicShadowLightChanged(callback) {
        this.On("dynamic_shadow_light_changed", callback);
    }
    static OnGameuiHidden(callback) {
        this.On("gameui_hidden", callback);
    }
    static OnItemsGifted(callback) {
        this.On("items_gifted", callback);
    }
    static OnWarmupEnd(callback) {
        this.On("warmup_end", callback);
    }
    static OnAnnouncePhaseEnd(callback) {
        this.On("announce_phase_end", callback);
    }
    static OnCsIntermission(callback) {
        this.On("cs_intermission", callback);
    }
    static OnCsGameDisconnected(callback) {
        this.On("cs_game_disconnected", callback);
    }
    static OnCsRoundFinalBeep(callback) {
        this.On("cs_round_final_beep", callback);
    }
    static OnCsRoundStartBeep(callback) {
        this.On("cs_round_start_beep", callback);
    }
    static OnCsWinPanelRound(callback) {
        this.On("cs_win_panel_round", callback);
    }
    static OnCsWinPanelMatch(callback) {
        this.On("cs_win_panel_match", callback);
    }
    static OnCsMatchEndRestart(callback) {
        this.On("cs_match_end_restart", callback);
    }
    static OnCsPreRestart(callback) {
        this.On("cs_pre_restart", callback);
    }
    static OnCsPrevNextSpectator(callback) {
        this.On("cs_prev_next_spectator", callback);
    }
    static OnShowDeathpanel(callback) {
        this.On("show_deathpanel", callback);
    }
    static OnHideDeathpanel(callback) {
        this.On("hide_deathpanel", callback);
    }
    static OnUgcMapInfoReceived(callback) {
        this.On("ugc_map_info_received", callback);
    }
    static OnUgcMapUnsubscribed(callback) {
        this.On("ugc_map_unsubscribed", callback);
    }
    static OnUgcMapDownloadError(callback) {
        this.On("ugc_map_download_error", callback);
    }
    static OnUgcFileDownloadFinished(callback) {
        this.On("ugc_file_download_finished", callback);
    }
    static OnUgcFileDownloadStart(callback) {
        this.On("ugc_file_download_start", callback);
    }
    static OnBeginNewMatch(callback) {
        this.On("begin_new_match", callback);
    }
    static OnMatchEndConditions(callback) {
        this.On("match_end_conditions", callback);
    }
    static OnEndmatchMapvoteSelectingMap(callback) {
        this.On("endmatch_mapvote_selecting_map", callback);
    }
    static OnEndmatchCmmStartRevealItems(callback) {
        this.On("endmatch_cmm_start_reveal_items", callback);
    }
    static OnNextlevelChanged(callback) {
        this.On("nextlevel_changed", callback);
    }
    static OnDmBonusWeaponStart(callback) {
        this.On("dm_bonus_weapon_start", callback);
    }
    static OnGgKilledEnemy(callback) {
        this.On("gg_killed_enemy", callback);
    }
    static OnSwitchTeam(callback) {
        this.On("switch_team", callback);
    }
    static OnTrialTimeExpired(callback) {
        this.On("trial_time_expired", callback);
    }
    static OnUpdateMatchmakingStats(callback) {
        this.On("update_matchmaking_stats", callback);
    }
    static OnClientDisconnect(callback) {
        this.On("client_disconnect", callback);
    }
    static OnClientLoadoutChanged(callback) {
        this.On("client_loadout_changed", callback);
    }
    static OnAddPlayerSonarIcon(callback) {
        this.On("add_player_sonar_icon", callback);
    }
    static OnAddBulletHitMarker(callback) {
        this.On("add_bullet_hit_marker", callback);
    }
    static OnSfuievent(callback) {
        this.On("sfuievent", callback);
    }
    static OnWeaponhudSelection(callback) {
        this.On("weaponhud_selection", callback);
    }
    static OnTrPlayerFlashbanged(callback) {
        this.On("tr_player_flashbanged", callback);
    }
    static OnTrMarkComplete(callback) {
        this.On("tr_mark_complete", callback);
    }
    static OnTrMarkBestTime(callback) {
        this.On("tr_mark_best_time", callback);
    }
    static OnTrExitHintTrigger(callback) {
        this.On("tr_exit_hint_trigger", callback);
    }
    static OnTrShowFinishMsgbox(callback) {
        this.On("tr_show_finish_msgbox", callback);
    }
    static OnTrShowExitMsgbox(callback) {
        this.On("tr_show_exit_msgbox", callback);
    }
    static OnBotTakeover(callback) {
        this.On("bot_takeover", callback);
    }
    static OnJointeamFailed(callback) {
        this.On("jointeam_failed", callback);
    }
    static OnTeamchangePending(callback) {
        this.On("teamchange_pending", callback);
    }
    static OnMaterialDefaultComplete(callback) {
        this.On("material_default_complete", callback);
    }
    static OnSeasoncoinLevelup(callback) {
        this.On("seasoncoin_levelup", callback);
    }
    static OnTournamentReward(callback) {
        this.On("tournament_reward", callback);
    }
    static OnStartHalftime(callback) {
        this.On("start_halftime", callback);
    }
    static OnPlayerDecal(callback) {
        this.On("player_decal", callback);
    }
    static OnSurvivalTeammateRespawn(callback) {
        this.On("survival_teammate_respawn", callback);
    }
    static OnSurvivalNoRespawnsWarning(callback) {
        this.On("survival_no_respawns_warning", callback);
    }
    static OnSurvivalNoRespawnsFinal(callback) {
        this.On("survival_no_respawns_final", callback);
    }
    static OnShowSurvivalRespawnStatus(callback) {
        this.On("show_survival_respawn_status", callback);
    }
    static OnGuardianWaveRestart(callback) {
        this.On("guardian_wave_restart", callback);
    }
    static OnNavBlocked(callback) {
        this.On("nav_blocked", callback);
    }
    static OnNavGenerate(callback) {
        this.On("nav_generate", callback);
    }
    static OnRepostXboxAchievements(callback) {
        this.On("repost_xbox_achievements", callback);
    }
    static OnMbInputLockSuccess(callback) {
        this.On("mb_input_lock_success", callback);
    }
    static OnMbInputLockCancel(callback) {
        this.On("mb_input_lock_cancel", callback);
    }
}
