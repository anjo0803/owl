require('dotenv').config();
const FS = require('fs');
const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v9')

// 
const COMMANDS = [];
let commandFiles = FS.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
commandFiles.forEach(commandFile => {
    let command = require(`./commands/${commandFile}`);
    COMMANDS.push(command.data.toJSON());
});

const restClient = new REST({version: '9'}).setToken(process.env.TOKEN);
restClient.put(Routes.applicationGuildCommands(process.env.APP_ID, process.env.GUILD_ID),
{body: COMMANDS}).then(() => console.log('Success'));