/*
 * ===== debate.js =====
 * 
 * Custom module for interacting with OWL debates.
 */


/* ===== Imports ===== */

const SQLite = require('./sql');
const utils = require('./utils');
const $ = require('./settings');
const { TABLES } = $;

const { WAProposal } = require('./nationscripts/responses');


/* ===== Export Content ===== */

/**
 * Represents a public OWL debate.
 */
class Debate {  // Hide the actual internal variables to avoid unsafe tampering
    /** @type {number} */   #id;
    /** @type {string} */   #proposal;
    /** @type {string} */   #title;
    /** @type {number} */   #draftingThread;
    /** @type {number} */   #discordThread;
    /** @type {number} */   #rmbPost;
    /** @type {{f:string[],a:string[],x:string[]}} */   #votes;

    /* ===== Instantiating Functions ===== */

    /**
     * Instantiates a completely new `Debate` object based on the provided proposal
     * and makes a corresponding database entry.
     * @param {WAProposal} proposal The base proposal for this Debate
     * @returns {Debate} The instantiated `Debate` object
     */
    static create(proposal) {
        if(!(proposal instanceof WAProposal)) { // Ensure type compliance
            utils.printWarn(`Refusing to create Debate on invalid proposal [${proposal}]!`);
            return undefined;
        } else utils.print(`Creating new Debate on proposal [${proposal.id}]...`);

        // Set initial cached data and prepare the DB entry
        let ret = new Debate();
        let data = {};
        data[TABLES.debate.id]              = ret.#proposal = proposal.id;
        data[TABLES.debate.proposalTitle]   = ret.#title = proposal.title;
        data[TABLES.debate.drafting]        = ret.#draftingThread = null;
        data[TABLES.debate.discordThread]   = ret.#discordThread = null;
        data[TABLES.debate.rmb]             = ret.#rmbPost = null;
        ret.#votes = {
            f: [],
            a: [],
            x: []
        };

        // Return the created Debate object and asynchronously update the DB
        SQLite.insert(TABLES.debate, data)
            .asUpdate()
            .then(() => utils.print(`Created new Debate on ${proposal.id}!`),
                    (err) => utils.printError(`Failed to create Debate! Reason: ${err}`));
        return ret;
    }

    /**
     * Instantiates a `Debate` object from the database entry with the given debate/proposal ID.
     * @param {number|string} id ID of, depending on `useProposalID`, the debate itself or the associated WA proposal
     * @param {boolean} useProposalID Whether to query by WA proposal ID instead of debate ID
     * @returns The instantiated `Debate` object
     */
    static async load(id, useProposalID = false) {
        if(typeof id != 'string' && typeof id != 'number') {    // Ensure type compliance
            utils.printWarn(`Refusing to load Debate from invalid ID [${id}]!`);
            return undefined;
        } else utils.printDebug(`Loading Debate with ${useProposalID ? 'proposal' : 'debate'} ID [${id}]...`);

        // Try to load the DB entry with the provided ID
        let ret = undefined, 
            res = await SQLite
                .select(TABLES.debate,
                    `${TABLES.debate.id} AS DID`,
                    `${TABLES.debate.proposalID} AS PID`,
                    `${TABLES.debate.proposalTitle} AS Title`,
                    `${TABLES.debate.drafting} AS NS`,
                    `${TABLES.debate.discordThread} AS Discord`,
                    `${TABLES.debate.rmb} AS RMB`)
                .where(useProposalID ? TABLES.debate.proposalID : TABLES.debate.id, '=', id)
                .asSingleQuery()
                .catch((err) => utils.printError(`Failed to load Debate! Reason: ${err}`));

        if(res) {   // If loaded successfully, instantiate a Debate object and assign its attributes
            ret = new Debate();
            ret.#id = res['DID'];
            ret.#proposal = res['PID'];
            ret.#title = res['Title'];
            ret.#draftingThread = res['NS'];
            ret.#discordThread = res['Discord'];
            ret.#rmbPost = res['RMB'];
            await ret.retrieveBallots();  // Ballots can't be loaded with the same query
        }
        return ret;
    }

    /* ===== Interaction Functions ===== */

    /* ===== Getting / Updating Functions */

    /**
     * The internal ID of this `Debate` identifying it in the database records.
     */
    get id() {
        return this.#id;
    }

    /**
     * Registers the given `WAProposal` as the one this `Debate` is about,
     * synchronously for this particular object and asynchronously in the database.
     * This updates both the proposal ID and the proposal title.
     * @param {WAProposal} wa The `WAProposal` to register as this `Debate`'s topic
     */
    set proposal(wa) {
        if(wa instanceof WAProposal) {  // Ensure type compliance
            let data = {};  // Update the cached data and prepare to update the database records
            data[TABLES.debate.proposalID] = this.#proposal = wa.id;
            data[TABLES.debate.proposalTitle] = this.#title = wa.title;
            SQLite
                .update(TABLES.debate, data)
                .where(TABLES.debate.id, '=', this.id)
                .asUpdate();
        } else utils.printWarn(`Refusing to set invalid WA proposal [${wa}] for Debate [${this.id}]!`);
    }

    /**
     * The cached ID of the WA proposal this `Debate` is about.
     */
    get proposalID() {
        return this.#proposal;
    }
    /**
     * Retrieves the ID of the WA proposal this `Debate` is about from the database.
     * and updates the cached value for it accordingly.
     * @returns {string} The loaded WA proposal ID
     */
    async retrieveProposalID() {
        return this.#proposal = (await SQLite
            .select(TABLES.debate, `${TABLES.debate.proposalID} AS PID`)
            .where(TABLES.debate.id, '=', this.id)
            .asSingleQuery())
            ?.['PID'];
    }

    /**
     * The cached title of the WA proposal this `Debate` is about.
     */
    get proposalTitle() {
        return this.#title;
    }
    /**
     * Retrieves the title of the WA proposal this `Debate` is about from the database.
     * @returns {string} The queried WA proposal title
     */
    async retrieveProposalTitle() {
        return this.#title = (await SQLite
            .select(TABLES.debate, `${TABLES.debate.proposalTitle} AS Title`)
            .where(TABLES.debate.id, '=', this.id)
            .asSingleQuery())
            ?.['Title'];
    }

    /**
     * Registers the given number as the ID of the NS forum thread for the WA proposal this `Debate` is about,
     * synchronously for this particular object and asynchronously in the database.
     * @param {number} threadID ID of the forum thread of the WA proposal
     */
    set forum(threadID) {
        switch(typeof threadID) {
            case 'undefined':   // If explicitly undefined, remove associated forum thread ID
                utils.print(`Removing [${this.forum}] as forum thread for Debate [${this.id}]`);
            case 'number':      // Otherwise, require it to be a number, else refuse to update
                let data = {};
                data[TABLES.debate.drafting] = this.#draftingThread = threadID;
                SQLite
                    .update(TABLES.debate, data)
                    .where(TABLES.debate.id, '=', this.id)
                    .asUpdate();
                break;
            default:
                utils.printWarn(`Refusing to set invalid forum thread [${threadID}] for Debate [${this.id}]!`);
                break;
        }
    }
    /**
     * The cached ID of the NS forum thread for the WA proposal this `Debate` is about.
     */
    get forum() {
        return this.#draftingThread;
    }
    /**
     * Retrieves the ID of the forum thread for the WA proposal this `Debate` is about from the database.
     * @returns {number} The queried forum thread ID
     */
    async retrieveForumThread() {
        return this.#draftingThread = (await SQLite
            .select(TABLES.debate, `${TABLES.debate.drafting} AS Thread`)
            .where(TABLES.debate.id, '=', this.id)
            .asSingleQuery())
            ?.['Thread'];
    }

    /**
     * Registers the given number as the ID of the TSP Discord thread calling this `Debate`,
     * synchronously for this particular object and asynchronously in the database.
     * @param {number} threadID ID of the Discord thread for this `Debate`
     */
     set discord(threadID) {
        switch(typeof threadID) {
            case 'undefined':   // If explicitly undefined, remove associated discord thread ID
                utils.print(`Removing [${this.discord}] as Discord thread for Debate [${this.id}]`);
            case 'number':      // Otherwise, require it to be a number, else refuse to update
                let data = {};
                data[TABLES.debate.discordThread] = this.#discordThread = threadID;
                SQLite
                    .update(TABLES.debate, data)
                    .where(TABLES.debate.id, '=', this.id)
                    .asUpdate();
                break;
            default:
                utils.printWarn(`Refusing to set invalid Discord thread [${threadID}] for Debate [${this.id}]!`);
                break;
        }
    }
    /**
     * The cached ID of the TSP Discord server thread for this `Debate`.
     */
    get discord() {
        return this.#discordThread;
    }
    /**
     * Retrieves the ID of the TSP Discord server thread for this `Debate` from the database.
     * @returns {number} The queried Discord thread ID
     */
    async retrieveDiscordThread() {
        return this.#discordThread = (await SQLite
            .select(TABLES.debate, `${TABLES.debate.discordThread} AS Thread`)
            .where(TABLES.debate.id, '=', this.id)
            .asSingleQuery())
            ?.['Thread'];
    }

    /**
     * Registers the given number as the ID of the Voting Center RMB post calling this `Debate`,
     * synchronously for this particular object and asynchronously in the database.
     * @param {number} threadID ID of the Voting Center RMB post calling this `Debate`
     */
     set rmb(postID) {
        switch(typeof postID) {
            case 'undefined':   // If explicitly undefined, remove associated RMB post ID
                utils.print(`Removing [${this.rmb}] as RMB post for Debate [${this.id}]`);
            case 'number':      // Otherwise, require it to be a number, else refuse to update
                let data = {};
                data[TABLES.debate.rmb] = this.#rmbPost = postID;
                SQLite
                    .update(TABLES.debate, data)
                    .where(TABLES.debate.id, '=', this.id)
                    .asUpdate();
                break;
            default:
                utils.printWarn(`Refusing to set invalid RMB post [${postID}] for Debate [${this.id}]!`);
                break;
        }
    }
    /**
     * The cached ID of the Voting Center RMB post calling this `Debate`.
     */
    get rmb() {
        return this.#rmbPost;
    }
    /**
     * Retrieves the ID of the Voting Center RMB post calling this `Debate` from the database.
     * @returns {number} The queried RMB post ID
     */
    async retrieveRMBPost() {
        return this.#rmbPost = (await SQLite
            .select(TABLES.debate, `${TABLES.debate.rmb} AS RMB`)
            .where(TABLES.debate.id, '=', this.id)
            .asSingleQuery())
            ?.['RMB'];
    }

    /**
     * Registers the given voting nation's ballot with the given stance,
     * both in the cached ballots and the database.
     * @param {string} voter Name of the nation that cast the ballot
     * @param {number} stance Stance of the voting nation
     */
    countVote(voter, stance) {
        // Ensure type compliance
        if(typeof voter != 'string') {
            utils.printWarn(`Refusing to count ballot by invalid voter [${voter}] for Debate [${this.id}]!`);
            return;
        } else if(typeof stance != 'number') {
            utils.printWarn(`Refusing to count invalid ballot [${stance}] for Debate [${this.id}]!`);
            return;
        } else utils.print(`Counting ballot [${stance}] by voter [${voter}] for Debate [${this.id}]`);

        voter = utils.unifyNID(voter);  // Ensure standardized format

        // If this voter already has a ballot in the cached ballots, remove it
        for(let b of Object.keys(this.ballots)) if(this.ballots[b].includes(voter)) {
            this.ballots[b].splice(this.ballots[b].indexOf(voter), 1);
            break;
        }   // And add the updated stance
        this.ballots[stance === $.BALLOTS.FOR ? 'f' : stance === $.BALLOTS.AGAINST ? 'a' : 'x'].push(voter);
        
        // Lastly, insert the record of the new ballot into the database, or update the existing record
        let data = {};
        data[TABLES.vote.debate] = this.id;
        data[TABLES.vote.nation] = voter;
        data[TABLES.vote.stance] = stance;
        SQLite
            .insert(TABLES.vote, data)
            .onConflict('UPDATE', TABLES.vote.debate, TABLES.vote.nation)
            .set(data)
            .where(TABLES.vote.debate, '=', this.id)
            .and(TABLES.vote.nation, '=', voter)
            .asUpdate();
    }
    /**
     * Removes any ballot cast by the given voting nation,
     * both from the cached ballots and the database.
     * @param {string} voter Name of the nation that to remove cast ballots of
     */
    discountVote(voter) {
        // Ensure type compliance
        if(typeof voter != 'string') {
            utils.printWarn(`Refusing to discount ballot by invalid voter [${voter}] for Debate [${this.id}]!`);
            return;
        } else utils.print(`Discounting any ballot by voter [${voter}] for Debate [${this.id}]`);

        voter = utils.unifyNID(voter);  // Ensure standardized format

        // Remove a possible ballot this voter cast from the cached ballots
        let removed = false;
        for(let b of Object.keys(this.ballots)) if(this.ballots[b].includes(voter)) {
            this.ballots[b].splice(this.ballots[b].indexOf(voter), 1);
            removed = true;
            break;
        }

        // If necessary, remove the ballot's database record
        if(removed) SQLite
            .delete(TABLES.vote)
            .where(TABLES.vote.debate, '=', this.id)
            .and(TABLES.vote.nation, '=', voter)
            .asUpdate();
    }
    /**
     * The cached OWL vote tally on the WA proposal this `Debate` is about.
     */
    get ballots() {
        return this.#votes;
    }
    /**
     * Retrieves the OWL vote tally on the WA proposal this `Debate` is about from the database.
     * @returns For each stance the queried list of associated voters
     */
    async retrieveBallots() {
        let ballots = await SQLite
            .select(TABLES.vote, 
                `${TABLES.vote.nation} AS Voter`, 
                `${TABLES.vote.stance} AS Ballot`)
            .join(TABLES.debate, TABLES.debate.id, '=', TABLES.vote.debate)
            .where(TABLES.vote.debate, '=', this.id)
            .asQuery();
        this.#votes = {
            f: [],
            a: [],
            x: []
        };
        for(let ballot of ballots) 
            if(ballot['Ballot'] === $.BALLOTS.FOR) this.#votes.f.push(ballot['Voter']);
            else if(ballot['Ballot'] === $.BALLOTS.AGAINST) this.#votes.a.push(ballot['Voter']);
            else if(ballot['Ballot'] === $.BALLOTS.ABSTAIN) this.#votes.x.push(ballot['Voter']);
        return this.#votes;
    }
}

module.exports = Debate;