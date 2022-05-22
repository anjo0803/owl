module.exports = (client) => {  // 
    client.handleEvents = async (eventFiles) => {
        for(let file of eventFiles) {
            let event = require(`../events/${file}`);
            if(event.once) client.once(event.name, (...args) => event.execute(client, ...args));
            else client.on(event.name, (...args) => event.execute(client, ...args));
        }
    };
};