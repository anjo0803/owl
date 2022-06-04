/*
 * ===== utils.js =====
 * 
 * Custom module for various utility functions that don't strictly belong
 * to any one other module and/or are used in many different places.
 */


/* ===== Imports ===== */

const $ = require('./settings');


/* ===== Helper Functions ===== */

function printTemplate(func, pre, msg) {
    func(`[${new Date().toLocaleTimeString('en-US', {hour12: false})}] [${pre}] ${msg}`);
}


/* ===== Export Content ===== */

module.exports = {

    /* ===== Logging methods ===== */

    /**
     * Formats the given message as regular info message and prints it to the console.
     * @param {string} msg Message to print
     */
    print: (msg) => printTemplate(console.log, 'BOT', msg),
    /**
     * Formats the given message as debug info message and prints it to the console if debugging.
     * @param {string} msg Message to print
     * @see `DEBUG` value in settings module
     */
    printDebug: (msg) => {
        if($.DEBUG) printTemplate(console.log, 'DEV', msg);
    },
    /**
     * Formats the given message as a warning and prints it to the console.
     * @param {string} msg Message to print
     */
    printWarn: (msg) => printTemplate(console.log, 'WRN', msg),
    /**
     * Formats the given message as an error and prints it to the console.
     * @param {string} msg Message to print
     */
    printError: (err) => printTemplate(console.error, 'ERR', err),


    /* ===== Functions For Standardizing Database Values ===== */

    /**
     * Modifies the provided nation ID into the standardized format used in the database.
     * @param {string} nid Value to be used as a NID in the database
     * @returns The standardized version of the provided NID
     */
    unifyNID: (nid) => nid.toLowerCase().replace(/ /g, '_'),


    /* ===== Miscellaneous Functions ===== */

};