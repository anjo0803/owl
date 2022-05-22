const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');

module.exports = (client) => {  // Put the command handler as a function of the client
    client.handleCommands = async (commandFolders) => {
        client.commandArray = [];   // Will contain the JSON data for each Slash Command to send to Discord

        // Go through every subfolder of the commands folder...
        for(let folder of commandFolders) {
            let commandFiles = fs.readdirSync(`./src/commands/${folder}`).filter(file => file.endsWith('.js'));

            // ...and get every command file contained in them
            for(let file of commandFiles) {
                let command = require(`../commands/${folder}/${file}`);
                client.commands.set(command.data.name, command);
                client.commandArray.push(command.data.toJSON());
            }
        }

        let rest = new REST({
            version: '9'
        }).setToken(process.env.TOKEN);

        (async () => {  // Asynchronously send the Slash Commands to Discord
            try {
                console.log('Refreshing Slash Commands');

                await rest.put(Routes.applicationGuildCommands(process.env.APP_ID, process.env.GUILD_ID), {
                    body: client.commandArray
                });

                console.log('Slash Commands have been refreshed!');
            } catch(error) {
                console.error(error);
            }
        })();
    };
};