/*
 * ===== settings.js =====
 * 
 * Custom module exclusively containing global constants.
 */

module.exports = {
    DEBUG: true,
    BALLOTS: {
        FOR: 0,
        AGAINST: 1,
        ABSTAIN: 2
    },
    TABLES: {
        debate: {
            _: 'debate',
            get id()            { return `${this._}.DID` },
            get proposalID()    { return `${this._}.PID` },
            get proposalTitle() { return `${this._}.Title` },
            get drafting()      { return `${this._}.Forum` },
            get discordThread() { return `${this._}.Discord` },
            get rmb()           { return `${this._}.RMB` }
        },
        nation: {
            _: 'nation',
            get id()            { return `${this._}.NID` },
            get discord()       { return `${this._}.User` }
        },
        opinion: {
            _: 'opinion',
            get debate()        { return `${this._}.DID` },
            get nation()        { return `${this._}.NID` },
            get comment()       { return `${this._}.Opinion` }
        },
        proposalAuthor: {
            _: 'proposal_author',
            get proposal()      { return `${this._}.PID` },
            get author()        { return `${this._}.Author` },
            get isSubmitting()  { return `${this._}.Submitting` }
        },
        reco: {
            _: 'reco',
            get debate()        { return `${this._}.DID` },
            get stance()        { return `${this._}.Stance` },
            get analysis()      { return `${this._}.Analysis` },
            get isOverride()    { return `${this._}.Override` }
        },
        vote: {
            _: 'vote',
            get debate()        { return `${this._}.DID` },
            get nation()        { return `${this._}.NID` },
            get stance()        { return `${this._}.Stance` }
        }
    }
};