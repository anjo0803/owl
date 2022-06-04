/*
 * ===== index.js =====
 * 
 * Entry point for the OWL Bot.
 */


/* ===== Imports ===== */

const utils = require('./utils');
const $ = require('./settings');

const { Client, Intents, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const fs = require('fs');

require('dotenv').config();


/* ===== Helper Functions ===== */

/**
 * Sets up the provided `Client` to handle emitted events as
 * described in the corresponding files in the events folder.
 * @param {Client} c Discord.js `Client` to add the even handling to
 */
function setupEventHandler(c) {
    let eventFiles = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'));
    for(let file of eventFiles) {
        let event = require(`./events/${file}`);
        if(event.once) c.once(event.name, (...args) => event.execute(c, ...args));
        else c.on(event.name, (...args) => event.execute(c, ...args));
    }
    utils.print('Event handler successfully initialized!');
}

/**
 * Sets up the provided `Client` to handle received commands as
 * described in the corresponding files in the commands folder.
 * @param {Client} c Discord.js `Client` to add the command handling to
 */
async function setupCommandHandler(c) {
    c.commands = new Collection();  // Will pair each command with its name

    // Load in all commands from the commands folder:
    let commandJson = [];
    let commandFiles = fs.readdirSync(`./src/commands`).filter(file => file.endsWith('.js'));
    for(let file of commandFiles) {
        let command = require(`./commands/${file}`);
        c.commands.set(command.data.name, command); // Pair the command with its name,
        commandJson.push(command.data.toJSON());    // and prepare its JSON data to send to Discord
    }
    utils.print('Command handler successfully initialized!');

    try {   // Then, send the JSON data for each command to Discord
        let rest = new REST({
            version: '9'
        }).setToken(process.env.TOKEN);
        rest.put(Routes.applicationGuildCommands(process.env.APP_ID, process.env.GUILD_ID), {
            body: commandJson
        }).then(() => utils.print('Slash command data successfully updated!'));
    } catch(error) {
        utils.printError(`Failed to update slash command data: ${error}`);
    }
}

/**
 * Prepares to listen for console input in order to run simple console-based commands.
 */
function setupConsoleCommands() {
    process.openStdin().addListener('data', (d) => {
        // Get the actual string that was entered into the console
        let c = d.toString().trim();
        let args = c.split(/ /g);
        switch(args[0]) {   // Act based on the command name
            case 'exit':
                utils.print('Exiting on console order');
                process.exit(0);
                break;
            default: utils.printWarn(`Refusing to execute invalid command [${c}] from console!`);
        }
    });
}


/* ===== Executed Code ===== */

utils.print(`Launching OWL Bot v${$.VERSION} by anjo/Tepertopia...`);

setupConsoleCommands();

// Set up the Client with the appropriate intents:
const CLIENT = new Client({intents: [
    
]});

// Initialize the evend and command handling
setupEventHandler(CLIENT);
setupCommandHandler(CLIENT);

// Finally, login
CLIENT.login(process.env.TOKEN);
process.on('exit', () => {
    CLIENT.destroy();
    utils.print('Bot client shut down.');
});