const {Client} = require('discord.js');
require('dotenv').config();

const CLIENT = new Client({
    intents: []
});

CLIENT.once('ready', () => {

});

CLIENT.login(process.env.TOKEN);