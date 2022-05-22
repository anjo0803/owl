function printTemplate(func, pre, msg) {
    func(`[${new Date().toLocaleTimeString('en-US', {hour12: false})}] [${pre}] ${msg}`);
}
module.exports = {
    print: (msg) => printTemplate(console.log, 'BOT', msg),
    printDebug: (msg) => printTemplate(console.log, 'DEV', msg),
    printWarn: (msg) => printTemplate(console.log, 'WRN', msg),
    printError: (err) => printTemplate(console.error, 'ERR', err)
};