import { using } from './ModClasses.js';

using('Terraria');
using('Terraria.Chat');
using('Microsoft.Xna.Framework');
using('Microsoft.Xna.Framework.Graphics');

let RespawnTimer = undefined;
let RespawnTimerBoss = undefined;

/**
 * @todo Saves the current configuration to the "ModConfig.json" file.
 * @see https://github.com/TerLauncher/TL-Mods/wiki/JavaScript-API#tl.mod.dataDirectory
 */
function loadConfig() {
    if (tl.file.exists("ModConfig.json")) {
        const configData = JSON.parse(tl.file.read("ModConfig.json"));
        RespawnTimer = configData.RespawnTimer || 600;
        EnabledNormalTime = configData.EnabledNormalTime || false;
        RespawnTimerBoss = configData.RespawnTimerBoss || 0;
        tl.log(`[Mod name]: ModConfig Loaded.`);
    } else {
        saveConfig();
    }
}

/**
 * @todo Loads the configuration from the "ModConfig.json" file. If the file does not exist, it creates a new one with default values.
 * @see https://github.com/TerLauncher/TL-Mods/wiki/JavaScript-API#tl.mod.dataDirectory
 */
function saveConfig() {
    const configData = {
        RespawnTimer,
        EnabledNormalTime,
        RespawnTimerBoss
    };
    tl.file.write("ModConfig.json", JSON.stringify(configData, null, 4));
    tl.log(`[Mod name]: Saved ModConfig`);
}

ChatCommandProcessor.ProcessIncomingMessage.hook(
    (original, self, message, client_id) => {
        original(self, message, client_id);

        const command = message.Text.toUpperCase();

        /**
         * @param {string} ComunCommand - the comun command
         * @param {string} SimpleCommand - the Shorter command
         * @param {number} timerVariable - Respawn timer
         * @returns {number} timer Variable if you input ComunCommand or SimpleCommand
        */
        const COMMAND_ADD = (ComunCommand, SimpleCommand, timerVariable) => {      
            if (command.startsWith(`/${ComunCommand}`) || command.startsWith(`/${SimpleCommand}`)) {
                const inputValue = parseInt(command.split(" ")[1]);
                if (!isNaN(inputValue)) {
                    timerVariable = inputValue * 60;
                    saveConfig();
                    Main.NewText(`Set to ${timerVariable / 60} seconds.`, 255, 255, 255);
                }
            }
            return timerVariable;
        };

        RespawnTimer = COMMAND_ADD("RESPAWNTIMER", "RR", RespawnTimer);
        RespawnTimerBoss = COMMAND_ADD("RESPAWNTIMERBOSS", "RB", RespawnTimerBoss);
    }
);

/**
 * @return {number} RespawnTimer - Modified respawn time based on configuration or original logic.
 */
Player.GetRespawnTime.hook((original, self, pvp) => {

    for (let i = 0; i < 200; i++) {
        if (Main.npc[i].boss && RespawnTimerBoss > 0) {
            return RespawnTimerBoss;
        }
    }

    return RespawnTimer;
});

loadConfig();
