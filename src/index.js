const { Client, Intents, Collection } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

// Set up the Client with the appropriate intents:
const CLIENT = new Client({intents: [

]});

CLIENT.commands = new Collection();

(async () => {
    // Load in the handlers and register them
    const functions = fs.readdirSync('./src/functions').filter(file => file.endsWith('.js'));
    const eventFiles = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'));
    const commandFolders = fs.readdirSync('./src/commands');
    for(file of functions) require(`./functions/${file}`)(CLIENT);
    CLIENT.handleEvents(eventFiles);
    CLIENT.handleCommands(commandFolders);

    CLIENT.login(process.env.TOKEN);
})();