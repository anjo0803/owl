/*
 * ===== ready.js =====
 * 
 * Custom module for handling the "ready" event.
 */


/* ===== Imports ===== */

const utils = require("../utils");


/* ===== General Handler ===== */

module.exports = {
    name: 'ready',
    once: true,
    async execute() {
        utils.print('OWL Bot is ready for operation!');
    }
};