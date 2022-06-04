/*
 * ===== interactionCreate.js =====
 * 
 * Custom module for handling triggered bot Interactions.
 */


/* ===== Imports ===== */

const utils = require("../utils");

const { Client, Interaction } = require("discord.js");


/* ===== Specialized Handler Functions ===== */

/**
 * Responds to the given `Interaction` as command.
 * @param {Client} client Discord.js `Client` of the bot
 * @param {Interaction} interaction The triggering `Interaction`
 * @returns `true` if execution was successfully handled, otherwise `false`
 */
async function handleCommand(client, interaction) {
    let command = client.commands.get(interaction.commandName);
    if(!command) {
        utils.printWarn(`Received unknown command [${interaction.command.name}]!`);
        return false;
    } else try {
        utils.printDebug(`Executing command [${interaction.commandName}] by [${interaction.user.tag}]...`);
        await command.execute(interaction);
        return true;
    } catch(error) {
        utils.printError(`Command [${interaction.commandName}] by [${interaction.user.tag}] failed: ${error}`);
        return false;
    }
}


/* ===== General Handler ===== */

module.exports = {
    name: 'interactionCreate',
    /**
     * Handles the triggering `Interaction` with the given bot `Client`;
     * more specialized functions are then called to handle the specifics of e.g. commands.
     * @param {Client} client Discord.js `Client` of the bot
     * @param {Interaction} interaction The triggering `Interaction`
     */
    async execute(client, interaction) {
        let replied = false;

        if(interaction.isCommand()) replied = await handleCommand(client, interaction);

        // If no response was sent yet, respond with a general error message 
        if(!replied) interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true
        });
    }
};