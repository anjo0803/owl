const { DeathCause, 
        NationShard, 
        NationPrivateShard, 
        RegionShard, 
        WorldShard, 
        WAShard } = require('./enums');

/* ===== General Helper Functions ===== */

/**
 * Gets the text content of the given property of the given index of the given base element.
 * @param {object} element Base object of which to get the property, as parsed by xml2js
 * @param {string} tag Name of the parsed XML tag to get the contents of
 * @param {number} index 0-indexed position of the desired content within the tag - useful if more than one tag of the same name at the same level of the XML root exists
 * @returns {string} The tag's text content if found, otherwise `undefined`
 */
function txt(element, tag, index = 0) {
    return element?.[tag]?.[index]?.toString().trim();
}
/**
 * Gets the numerical content of the given property of the given base element.
 * @param {object} element Base object, as parsed by xml2js
 * @param {string} tag Name of the parsed XML tag to get the contents of
 * @returns {number} The tag's numerical content if found, otherwise `undefined`
 */
function num(element, tag) {
    let ret = txt(element, tag);
    if(ret)
        if(/^\d+$/.test(ret)) return parseInt(ret);
        else if(/^\d+\.d+$/.test(ret)) return parseFloat(ret);
    return undefined;
}
/**
 * Gets the array of text contents of the given child property of the given base element.
 * @param {object[]} element Base object of which to get the children, as parsed by xml2js
 * @param {string} tag Name of the parsed XML tag wrapping each child to get the contents of
 * @returns {string[]} An array of the text contents of the given children properties if found, otherwise `undefined`
 */
function txtArr(element, tag) {
    return element?.[0]?.[tag];
}

/* ===== Specific Helper Functions ===== */

/**
 * Translates the parsed XML's census data into an accessible form.
 * @param {object} base Root object of the xml2js-parsed `<CENSUS>` XML tag
 * @returns An array containing, at the requested censuses' IDs as indexes, objects with the available census data
 */
function census(base) {
    if(base?.length == 1) {
        let ret = [];
        for(let scale of base[0]['SCALE']) ret[scale['$'].id] = {
            score: num(scale, 'SCORE'),
            rankRegion: num(scale, 'RRANK'),
            rankRegionPercent: num(scale, 'PRRANK'),
            rankWorld: num(scale, 'RANK'),
            rankWorldPercent: num(scale, 'PRANK')
        };
        return ret;
    }
}
/**
 * Translates the parsed XML's census rank data into an accessible form.
 * @param {object} base Root object of the xml2js-parsed `<CENSUSRANKS>` XML tag
 * @returns An object containing the requested census' ID as well as an array of objects with the available census rank data
 */
function censusRanks(base) {
    if(base?.length == 1) {
        let tmp = [];
        for(let rank of base[0]['NATIONS']?.[0]?.['NATION']) tmp.push({
            nation: txt(rank, 'NAME'),
            rank: num(rank, 'RANK'),
            score: num(rank, 'SCORE')
        });
        return {
            id: parseInt(base[0]['$']?.id),
            nations: tmp
        };
    }
}
/**
 * Extracts the percentage of national deaths attributed to the given cause from the parsed XML data.
 * @param {object} base Root object of the xml2js-parsed `<DEATHS>` XML tag
 * @param {DeathCause} type Death cause to search for the data of
 * @returns The percentage share of deaths caused by the provided cause
 */
function deaths(base, type) {
    for(let cause of base?.[0]?.['CAUSE']) if(cause['$']?.type == type) return parseFloat(cause._);
    return 0;
}
/**
 * Translates the parsed XML's dispatch/factbook data into an accessible form.
 * @param {object} base Root object of the xml2js-parsed `<DISPATCH>`/`FACTBOOK` XML tag
 * @param {boolean} factbook Whether to look for `FACTBOOK` instead of `DISPATCH` tags
 * @returns An array containing `Dispatch` instances with the available dispatch/factbook data
 */
function dispatchlist(base, factbook) {
    if(base?.length  == 1) {
        let ret = [];
        for(let dispatch of base[0][factbook ? 'FACTBOOK' : 'DISPATCH']) ret.push(new Dispatch(dispatch));
        return ret;
    }
}
/**
 * Translates the parsed XML's happenings/history data into an accessible form.
 * @param {object} base Root object of the xml2js-parsed `<HAPPENINGS>`/`<HISTORY>` XML tag
 * @returns An array containing objects with the available happenings/history data
 */
function happenings(base) {
    if(base?.length == 1) {
        let ret = [];
        for(let event of base[0]['EVENT']) ret.push({
            id: parseInt(event['$']?.id),
            timestamp: num(event, 'TIMESTAMP'),
            text: txt(event, 'TEXT')
        });
        return ret;
    }
}
/**
 * Translates the parsed XML's policy data into an accessible form.
 * @param {object} base Root object of the xml2js-parsed `<POLICIES>` XML tag
 * @returns An object with the available policy data
 */
function policies(base) {
    if(base?.length == 1) {
        let ret = [];
        for(let policy of base[0]['POLICY']) ret.push({
            name: txt(policy, 'NAME'),
            img: txt(policy, 'PIC'),
            area: txt(policy, 'CAT'),
            description: txt(policy, 'DESC')
        });
        return ret;
    }
}
/**
 * Translates the parsed XML's poll data into an accessible form.
 * @param {object} base Root object of the xml2js-parsed `<POLL>` XML tag
 * @returns An object with the available poll data
 */
function poll(base) {
    if(base?.length == 1) {
        let ret = {
            id: base[0]['$']?.id,
            title: txt(base[0], 'TITLE'),
            text: txt(base[0], 'TEXT'),
            region: txt(base[0], 'REGION'),
            start: num(base[0], 'START'),
            end: num(base[0], 'STOP'),
            author: txt(base[0], 'AUTHOR'),
            options: []
        }
        for(let option of base[0]['OPTIONS']?.[0]?.['OPTION']) ret.options[option['$']?.id] = {
            id: option['$']?.id,
            description: txt(option, 'OPTIONTEXT'),
            voters: txt(option, 'VOTERS')?.split(/\:/gm) || []
        };
        return ret;
    }
}
/**
 * Translates the parsed XML's WA badges data into an accessible form.
 * @param {object} base Root object of the xml2js-parsed `<WABADGES>` XML tag
 * @returns An array containing objects with the available badge data
 */
function waBadges(base) {
    if(base?.length == 1) {
        let ret = [];
        for(let badge of base[0]['WABADGE']) ret.push({
            type: badge['$'].type,
            resolution: badge._
        });
        return ret;
    }
}

/* ===== Response Classes ===== */

/**
 * Represents a nation in the NationStates multiverse.
 */
class Nation {
    /* Shards Supported: */
    #admirable;
    #admirables;
    #animal;
    #animaltrait;
    #answered;
    #banner;
    #banners;
    #tgcancampaign;
    #capital;
    #category;
    #census;
    #crime;
    #currency;
    #customleader;
    #customcapital;
    #customreligion;
    #rcensus;
    #wcensus;
    #dbid;
    #deaths;
    #demonym;
    #demonym2;
    #demonym2plural;
    #dispatches;
    #dispatchlist;
    #endorsements;
    #factbooks;
    #factbooklist;
    #firstlogin;
    #flag;
    #founded;
    #foundedtime;
    #freedom;
    #fullname;
    #gdp;
    #govtdesc;
    #happenings;
    #hdi;
    #income;
    #poorest;
    #richest;
    #industrydesc;
    #influence;
    #lastactivity;
    #lastlogin;
    #leader;
    #legislation;
    #majorindustry;
    #motto;
    #name;
    #notable;
    #notables;
    #policies;
    #population;
    #govt;
    #tgcanrecruit;
    #religion;
    #region;
    #publicsector;
    #sectors;
    #sensibilities;
    #govtpriority;
    #tax;
    #type;
    #wa;
    #wabadges;
    #gavote;
    #scvote;
    #dossier;
    #issues;
    #issuesummary;
    #nextissue;
    #nextissuetime;
    #notices;
    #packs;
    #ping;
    #rdossier;
    #unread;

    /**
     * Creates a new Nation instance from the given data.
     * @param {NSRequest} req The request to the NS API for which the Nation is to be the parsed response
     * @param {object} res The xml2js-parsed XML response from the API
     */
    constructor(req, res) {
        for(let shard of req.getShards()) switch(shard) {

            /* ===== Primitive properties ===== */

            case NationShard.ADMIRABLE:             this.#admirable         = txt(res, 'ADMIRABLE'); break;
            case NationShard.ADMIRABLES:            this.#admirables        = txtArr(res['ADMIRABLES'], 'ADMIRABLE'); break;
            case NationShard.ANIMAL:                this.#animal            = txt(res, 'ANIMAL'); break;
            case NationShard.ANIMAL_TRAIT:          this.#animaltrait       = txt(res, 'ANIMALTRAIT'); break;
            case NationShard.ISSUES_ANSWERED:       this.#answered          = txt(res, 'ISSUES_ANSWERED'); break;
            case NationShard.BANNER:                this.#banner            = txt(res, 'BANNER'); break;
            case NationShard.BANNERS:               this.#banners           = txtArr(res['BANNERS'], 'BANNER'); break;
            case NationShard.CAPITAL:               this.#capital           = txt(res, 'CAPITAL'); break;
            case NationShard.CATEGORY:              this.#category          = txt(res, 'CATEGORY'); break;
            case NationShard.CRIME:                 this.#crime             = txt(res, 'CRIME'); break;
            case NationShard.CURRENCY:              this.#currency          = txt(res, 'CURRENCY'); break;
            case NationShard.CUSTOM_LEADER:         this.#customleader      = txt(res, 'LEADER', req.getShards().includes(NationShard.LEADER) ? 1 : 0); break;
            case NationShard.CUSTOM_CAPITAL:        this.#customcapital     = txt(res, 'CAPITAL', req.getShards().includes(NationShard.CAPITAL) ? 1 : 0); break;
            case NationShard.CUSTOM_RELIGION:       this.#customreligion    = txt(res, 'RELIGION', req.getShards().includes(NationShard.RELIGION) ? 1 : 0); break;
            case NationShard.DATABASE_ID:           this.#dbid              = txt(res, 'DBID'); break;
            case NationShard.DEMONYM_ADJECTIVE:     this.#demonym           = txt(res, 'DEMONYM'); break;
            case NationShard.DEMONYM_NOUN:          this.#demonym2          = txt(res, 'DEMONYM2'); break;
            case NationShard.DEMONYM_NOUN_PLURAL:   this.#demonym2plural    = txt(res, 'DEMONYM2PLURAL'); break;
            case NationShard.DISPATCHES:            this.#dispatches        = num(res, 'DISPATCHES'); break;
            case NationShard.ENDORSEMENTS:          this.#endorsements      = txt(res, 'ENDORSEMENTS')?.split(/\,/gm); break;
            case NationShard.FACTBOOKS:             this.#factbooks         = num(res, 'FACTBOOKS'); break;
            case NationShard.FIRST_LOGIN:           this.#firstlogin        = num(res, 'FIRSTLOGIN'); break;
            case NationShard.FLAG:                  this.#flag              = txt(res, 'FLAG'); break;
            case NationShard.FOUNDED:               this.#founded           = txt(res, 'FOUNDED'); break;
            case NationShard.FOUNDED_TIME:          this.#foundedtime       = txt(res, 'FOUNDEDTIME'); break;
            case NationShard.FULL_NAME:             this.#fullname          = txt(res, 'FULLNAME'); break;
            case NationShard.VOTE_GA:               this.#gavote            = txt(res, 'GAVOTE'); break;
            case NationShard.GDP:                   this.#gdp               = num(res, 'GDP'); break;
            case NationShard.GOVERNMENT_PRIORITY:   this.#govtpriority      = txt(res, 'GOVTPRIORITY'); break;
            case NationShard.GOVERNMENT_DESCRIPTION:this.#govtdesc          = txt(res, 'GOVTDESC');break;
            case NationShard.INCOME:                this.#income            = num(res, 'INCOME'); break;
            case NationShard.INDUSTRY_DESCRIPTION:  this.#industrydesc      = txt(res, 'INDUSTRYDESC');break;
            case NationShard.INFLUENCE:             this.#influence         = txt(res, 'INFLUENCE'); break;
            case NationShard.LAST_ACTIVITY:         this.#lastactivity      = txt(res, 'LASTACTIVITY'); break;
            case NationShard.LAST_LOGIN:            this.#lastlogin         = num(res, 'LASTLOGIN'); break;
            case NationShard.LEADER:                this.#leader            = txt(res, 'LEADER'); break;
            case NationShard.LEGISLATION:           this.#legislation       = txtArr(res['LEGISLATION'], 'LAW'); break;
            case NationShard.MAJOR_INDUSTRY:        this.#majorindustry     = txt(res, 'MAJORINDUSTRY'); break;
            case NationShard.MOTTO:                 this.#motto             = txt(res, 'MOTTO'); break;
            case NationShard.NAME:                  this.#name              = txt(res, 'NAME'); break;
            case NationShard.NOTABLE:               this.#notable           = txt(res, 'NOTABLE'); break;
            case NationShard.NOTABLES:              this.#notables          = txtArr(res['NOTABLES'], 'NOTABLE'); break;
            case NationShard.INCOME_POOREST:        this.#poorest           = num(res, 'POOREST'); break;
            case NationShard.POPULATION:            this.#population        = num(res, 'POPULATION'); break;
            case NationShard.PUBLIC_SECTOR:         this.#publicsector      = num(res, 'PUBLICSECTOR'); break;
            case NationShard.REGION:                this.#region            = txt(res, 'REGION'); break;
            case NationShard.RELIGION:              this.#religion          = txt(res, 'RELIGION'); break;
            case NationShard.INCOME_RICHEST:        this.#richest           = txt(res, 'RICHEST'); break;
            case NationShard.VOTE_SC:               this.#scvote            = txt(res, 'SCVOTE'); break;
            case NationShard.SENSIBILITIES:         this.#sensibilities     = txt(res, 'SENSIBILITIES'); break;
            case NationShard.TAX:                   this.#tax               = num(res, 'TAX'); break;
            case NationShard.TG_RECRUITABLE:        this.#tgcanrecruit      = txt(res, 'TGCANRECRUIT'); break;
            case NationShard.TG_CAMPAIGNABLE:       this.#tgcancampaign     = txt(res, 'TGCANCAMPAIGN'); break;
            case NationShard.TYPE:                  this.#type              = txt(res, 'TYPE'); break;
            case NationShard.WA_STATUS:             this.#wa                = txt(res, 'UNSTATUS'); break;

            case NationPrivateShard.DOSSIER_NATIONS:this.#dossier           = txtArr(res['DOSSIER'], 'NATION'); break;
            case NationPrivateShard.NEXT_ISSUE:     this.#nextissue         = txt(res, 'NEXTISSUE'); break;
            case NationPrivateShard.NEXT_ISSUE_TIME:this.#nextissuetime     = num(res, 'NEXTISSUETIME'); break;
            case NationPrivateShard.PACKS:          this.#packs             = num(res, 'PACKS'); break;
            case NationPrivateShard.PING:           this.#ping              = num(res, 'PING') == 1; break;
            case NationPrivateShard.DOSSIER_REGIONS:this.#rdossier          = txtArr(res['RDOSSIER'], 'REGION'); break;

            /* ===== Object properties ===== */

            case NationShard.CENSUS:
                this.#census = census(res['CENSUS']);
                break;
            case NationShard.DEATHS:
                let deathC = res['DEATHS'];
                if(deathC?.length == 1) this.#deaths = {
                    accident:           deaths(deathC, DeathCause.ACCIDENT),
                    age:                deaths(deathC, DeathCause.AGE),
                    animalAttack:       deaths(deathC, DeathCause.ANIMAL_ATTACK),
                    bungee:             deaths(deathC, DeathCause.BUNGEE_JUMPING),
                    cancer:             deaths(deathC, DeathCause.CANCER),
                    capitalPunishment:  deaths(deathC, DeathCause.CAPITAL_PUNISHMENT),
                    disappearance:      deaths(deathC, DeathCause.DISAPPEARANCE),
                    euthanasia:         deaths(deathC, DeathCause.EUTHANASIA),
                    exposure:           deaths(deathC, DeathCause.EXPOSURE),
                    god:                deaths(deathC, DeathCause.GOD),
                    heartDisease:       deaths(deathC, DeathCause.HEART_DISEASE),
                    malnourishment:     deaths(deathC, DeathCause.MALNOURISHMENT),
                    murder:             deaths(deathC, DeathCause.MURDER),
                    nuclear:            deaths(deathC, DeathCause.SPILL),
                    sacrifice:          deaths(deathC, DeathCause.SACRIFICE),
                    scurvy:             deaths(deathC, DeathCause.SCURVY),
                    shuttleMishap:      deaths(deathC, DeathCause.SHUTTLE_MISHAP),
                    suicide:            deaths(deathC, DeathCause.SUICIDE),
                    sunburn:            deaths(deathC, DeathCause.SUNBURN),
                    vatLeakage:         deaths(deathC, DeathCause.VAT_LEAKAGE),
                    war:                deaths(deathC, DeathCause.WAR),
                    wilderness:         deaths(deathC, DeathCause.WILDERNESS),
                    work:               deaths(deathC, DeathCause.WORK)
                };
                break;
            case NationShard.DISPATCH_LIST:
                this.#dispatchlist = dispatchlist(res['DISPATCHLIST'], false);
                break;
            case NationShard.FACTBOOK_LIST:
                this.#factbooklist = dispatchlist(res['FACTBOOKLIST'], true);
                break;
            case NationShard.FREEDOM:
                let freedoms = res['FREEDOM'];
                if(freedoms?.length == 1) this.#freedom = {
                    civilRights: txt(freedoms[0], 'CIVILRIGHTS'),
                    economy: txt(freedoms[0], 'ECONOMY'),
                    politicalFreedom: txt(freedoms[0], 'POLITICALFREEDOM')
                };
                break;
            case NationShard.GOVERNMENT_SPENDING:
                let spending = res['GOVT'];
                if(spending?.length == 1) this.#govt = {
                    admin:          num(spending[0], 'ADMINISTRATION'),
                    defense:        num(spending[0], 'DEFENCE'),
                    education:      num(spending[0], 'EDUCATION'),
                    environment:    num(spending[0], 'ENVIRONMENT'),
                    health:         num(spending[0], 'HEALTHCARE'),
                    industry:       num(spending[0], 'COMMERCE'),
                    aid:            num(spending[0], 'INTERNATIONALAID'),
                    law:            num(spending[0], 'LAWANDORDER'),
                    transport:      num(spending[0], 'PUBLICTRANSPORT'),
                    social:         num(spending[0], 'SOCIALEQUALITY'),
                    spirituality:   num(spending[0], 'SPIRITUALITY'),
                    welfare:        num(spending[0], 'WELFARE'),
                };
                break;
            case NationShard.HAPPENINGS:
                this.#happenings = happenings(res['HAPPENINGS']);
                break;
            case NationShard.HDI:
                this.#hdi = {
                    score: num(res, 'HDI'),
                    makeup: {
                        economy: num(res, 'HDI-ECONOMY'),
                        smartness: num(res, 'HDI-SMART'),
                        lifespan: num(res, 'HDI-LIFESPAN')
                    }
                }
                break;
            case NationShard.POLICIES:
                this.#policies = policies(res['POLICIES']);
                break;
            case NationShard.REGIONAL_CENSUS:
                let rscale = res['RCENSUS'];
                if(rscale?.length == 1) this.#rcensus = {
                    id: parseInt(rscale[0]['$'].id),
                    rank: rscale[0]._
                };
                break;
            case NationShard.WORLD_CENSUS:
                let wscale = res['WCENSUS'];
                if(wscale?.length == 1) this.#wcensus = {
                    id: parseInt(wscale[0]['$'].id),
                    rank: wscale[0]._
                };
                break;
            case NationShard.SECTORS:
                let sectorsC = res['SECTORS'];
                if(sectorsC?.length == 1) this.#sectors = {
                    blackMarket: num(sectorsC[0], 'BLACKMARKET'),
                    government: num(sectorsC[0], 'GOVERNMENT'),
                    privateIndustry: num(sectorsC[0], 'INDUSTRY'),
                    publicIndustry: num(sectorsC[0], 'PUBLIC')
                };
                break;
            case NationShard.WA_BADGES:
                this.#wabadges = waBadges(res['WABADGES']);
                break;

            case NationPrivateShard.ISSUES:
                let issuesC = res['ISSUES'];
                if(issuesC?.length == 1) {
                    this.#issues = [];
                    for(let issue of issuesC[0]['ISSUE']) {
                        let options = [];
                        for(let option of issue['OPTION']) options.push({
                            id: option['$']?.id,
                            argument: option._
                        });
                        this.#issues.push({
                            id: issue['$']?.id,
                            title: txt(issue, 'TITLE'),
                            description: txt(issue, 'TEXT'),
                            author: txt(issue, 'AUTHOR'),
                            editor: txt(issue, 'EDITOR'),
                            pics: [ txt(issue, 'PIC1'), txt(issue, 'PIC2') ],
                            options: options
                        });
                    }
                }
                break;
            case NationPrivateShard.ISSUES_SUMMARY:
                let summaryC = res['ISSUESUMMARY'];
                if(summaryC?.length == 1) {
                    this.#issuesummary = [];
                    for(let issue of summaryC[0]['ISSUE']) this.#issuesummary.push({
                        id: issue['$']?.id,
                        title: issue._
                    });
                }
                break;
            case NationPrivateShard.NOTICES:
                let noticesC = res['NOTICES'];
                if(noticesC?.length == 1) {
                    this.#notices = [];
                    for(let notice of noticesC[0]['NOTICE']) this.#notices.push({
                        unread: num(notice, 'NEW') == 1,
                        ok: num(notice, 'OK') == 1,
                        title: txt(notice, 'TITLE'),
                        type: txt(notice, 'TYPE'),
                        icon: txt(notice, 'TYPE_ICON'),
                        who: txt(notice, 'WHO'),
                        whoLink: txt(notice, 'WHO_URL'),
                        text: txt(notice, 'TEXT'),
                        timestamp: num(notice, 'TIMESTAMP'),
                        clickURL: txt(notice, 'URL')
                    });
                }
                break;
            case NationPrivateShard.UNREADS:
                let unreadC = res['UNREAD'];
                if(unreadC?.length == 1) {
                    this.#unread = {
                        issues: num(unreadC[0], 'ISSUES'),
                        telegrams: num(unreadC[0], 'TELEGRAMS'),
                        notices: num(unreadC[0], 'NOTICES'),
                        rmb: num(unreadC[0], 'RMB'),
                        wa: num(unreadC[0], 'WA'),
                        news: num(unreadC[0], 'NEWS')
                    }
                }
                break;
        }
        this.#verified          = num(res, 'VERIFY') == 1;
    }
    /** A randomly-selected admirable of the nation. */
    get admirable()         { return this.#admirable }
    /** Full list of this nation's admirables. */
    get admirables()        { return this.#admirables }
    /** This nation's national animal. */
    get animal()            { return this.#animal }
    /** Written description of this nation's animal's behaviour. */
    get animalTrait()       { return this.#animaltrait }
    /** Count of issues answered by this nation. */
    get issuesAnswered()    { return this.#answered }
    /** Primary banner of this nation if set, otherwise a random enabled banner of this nation. */
    get banner()            { return this.#banner }
    /** Full list of enabled banners for this nation. */
    get banners()           { return this.#banners }
    /** Whether this nation accepts campaign telegrams. */
    get campaignable()      { return this.#tgcancampaign }
    /** This nation's capital. */
    get capital()           { return this.#capital }
    /** World census category of this nation. */
    get category()          { return this.#category }
    /** World census data requested for this nation, with census ID corresponding to array index. */
    get census()            { return this.#census }
    /** Written description of crime levels in this nation. */
    get crime()             { return this.#crime }
    /** This nation's currency. */
    get currency()          { return this.#currency }
    /** Name of this nation's custom leader; blank if none set. */
    get customLeader()      { return this.#customleader }
    /** Name of this nation's custom capital; blank if none set. */
    get customCapital()     { return this.#customcapital }
    /** Name of this nation's custom religion; blank if none set. */
    get customReligion()    { return this.#customreligion }
    /** Score of this nation on and ID of the requested census scale regionwide. */
    get dailyCensusRegion() { return this.#rcensus }
    /** Score of this nation on and ID of the requested census scale worldwide. */
    get dailyCensusWorld()  { return this.#wcensus }
    /** This nation's ID in the NS database. */
    get databaseID()        { return this.#dbid }
    /** Full makeup of deaths in this nation by cause. */
    get deaths()            { return this.#deaths }
    /** This nation's adjective demonym. */
    get demonymAdjective()  { return this.#demonym }
    /** The singular of this nation's noun demonym. */
    get demonymNoun()       { return this.#demonym2 }
    /** The plural of this nation's noun demonym. */
    get demonymNounPlural() { return this.#demonym2plural }
    /** Count of this nation's published dispatches. */
    get dispatchCount()     { return this.#dispatches }
    /** List of this nation's published dispatches. */
    get dispatchList()      { return this.#dispatchlist }
    /** List of the names of nations endorsing this nation. */
    get endorsementList()   { return this.#endorsements }
    /** Count of this nation's published factbooks.. */
    get factbookCount()     { return this.#factbooks }
    /** List of this nation's published factbooks. */
    get factbookList()      { return this.#factbooklist }
    /** Unix timestamp of when this nation first logged in. */
    get firstLogin()        { return this.#firstlogin }
    /** URL of this nation's flag on the NS servers. */
    get flag()              { return this.#flag }
    /** Written description of when this nation was founded. */
    get founded()           { return this.#founded }
    /** Unix timestamp of when this nation was founded. */
    get foundedTime()       { return this.#foundedtime }
    /** Written descriptions of this nation's three freedom categories. */
    get freedoms()          { return this.#freedom }
    /** The full name of this nation (pretitle + name). */
    get fullName()          { return this.#fullname }
    /** This nation's GDP. */
    get gdp()               { return this.#gdp }
    /** Written description of this nation's government. */
    get governmentSummary() { return this.#govtdesc }
    /** The national happenings of this nation. */
    get happenings()        { return this.#happenings }
    /** The details of this nation's HDI score makeup. */
    get hdi()               { return this.#hdi }
    /** Average income of this nation's citizens. */
    get incomeMedian()      { return this.#income }
    /** Average income of this nation's poorest citizens. */
    get incomePoorest()     { return this.#poorest }
    /** Average income of this nation's richest citizens. */
    get incomeRichest()     { return this.#richest }
    /** Written description of this nation's industries. */
    get industrySummary()   { return this.#industrydesc }
    /** This nation's influence level in its region. */
    get influenceLevel()    { return this.#influence }
    /** Written description of when this nation last logged in. */
    get lastActivity()      { return this.#lastactivity }
    /** Unix timestamp of when this nation last logged in. */
    get lastLogin()         { return this.#lastlogin }
    /** This nation's leader. */
    get leader()            { return this.#leader }
    /** The effects of recently passed legislation of this nation. */
    get legislation()       { return this.#legislation }
    /** Which of this nation's industries is the largest. */
    get majorIndustry()     { return this.#majorindustry }
    /** This nation's motto. */
    get motto()             { return this.#motto }
    /** This nation's name. */
    get name()              { return this.#name }
    /** A randomly-selected notable of this nation. */
    get notable()           { return this.#notable }
    /** The full list of this nation's notables. */
    get notables()          { return this.#notables }
    /** The full list of policies this nation has adopted. */
    get policies()          { return this.#policies }
    /** This nation's population. */
    get population()        { return this.#population }
    /** The full makeup of the government's expenditures by topic. */
    get publicSpending()    { return this.#govt }
    /** Whether this nation accepts recruitment telegrams. */
    get recruitable()       { return this.#tgcanrecruit }
    /** This nation's national religion. */
    get religion()          { return this.#religion }
    /** The share of the GDP consisting of the public sector. */
    get sectorPublic()      { return this.#publicsector }
    /** The full makeup of this nation's GDP by sector. */
    get sectors()           { return this.#sectors }
    /** The full list of this nation's sensibilities. */
    get sensibilities()     { return this.#sensibilities }
    /** Which of the government's expenditures by topic is the largest. */
    get spendingPriority()  { return this.#govtpriority }
    /** The average income tax rate of this nation. */
    get tax()               { return this.#tax }
    /** This nation's pretitle. */
    get type()              { return this.#type }
    /** The WA membership status of this nation. */
    get waStatus()          { return this.#wa }
    /** The badges of commendation and condemnation this nation has received. */
    get waBadges()          { return this.#wabadges }
    /** How this nation has voted in the General Assembly. */
    get voteGA()            { return this.#gavote }
    /** How this nation has voted in the Security Council. */
    get voteSC()            { return this.#scvote }

    /** Names of the nations in this nation's dossier. */
    get dossierNations()    { return this.#dossier }
    /** Names of the regions in this nation's dossier. */
    get dossierRegions()    { return this.#rdossier }
    /** The issues currently confronting this nation. */
    get issues()            { return this.#issues }
    /** IDs and headlines of issues currently confronting this nation. */
    get issueHeadlines()    { return this.#issuesummary }
    /** Written description of when the next issue will arrive for this nation. */
    get nextIssue()         { return this.#nextissue }
    /** Unix timestamp of when the next issue will arrive for this nation. */
    get nextIssueTime()     { return this.#nextissuetime }
    /** The notices this nation has received. */
    get notices()           { return this.#notices }
    /** The number of cards this nation has in stock. */
    get packsAvailable()    { return this.#packs }
    /** Whether a ping was successful in the request yielding this `Nation`. */
    get pingSuccess()       { return this.#ping }
    /** How much new stuff this nation hasn't looked at yet. */
    get unreads()           { return this.#unread }

    #verified;
    /** Whether verification was successful in the request yielding this `Nation`. */
    get verifySuccess()     { return this.#verified }
}

class Region {
    /* Shards Supported: */
    #banner;
    #bannerby;
    #census;
    #censusranks;
    #dbid;
    #delegate;
    #delegateauth;
    #delegatevotes;
    #dispatches;
    #embassies;
    #embassyrmb;
    #flag;
    #founded;
    #foundedtime;
    #founder;
    #founderauth;
    #happenings;
    #history;
    #lastupdate;
    #mostposts;
    #mostliked;
    #mostlikes;
    #name;
    #nations;
    #numnations;
    #officers;
    #poll;
    #power;
    #messages;
    #tags;
    #gavote;
    #scvote;
    #wabadges;
    #factbook;

    constructor(req, res) {
        for(let shard of req.getShards()) switch(shard) {

            /* ===== Primitive properties ===== */

            case RegionShard.BANNER:                this.#banner        = txt(res, 'BANNER'); break;
            case RegionShard.BANNER_CREATOR:        this.#bannerby      = txt(res, 'BANNERBY'); break;
            case RegionShard.DATABASE_ID:           this.#dbid          = txt(res, 'DBID'); break;
            case RegionShard.DELEGATE:              this.#delegate      = txt(res, 'DELEGATE'); break;
            case RegionShard.DELEGATE_AUTHORITY:    this.#delegateauth  = txt(res, 'DELEGATEAUTH')?.split(/(?=[\s\S])/gu); break;
            case RegionShard.DELEGATE_VOTE_WEIGHT:  this.#delegatevotes = num(res, 'DELEGATEVOTES');
            case RegionShard.DISPATCHES:            this.#dispatches    = txt(res, 'DISPATCHES')?.split(/\,/g); break;
            case RegionShard.EMBASSY_RMB_POSTING:   this.#embassyrmb    = txt(res, 'EMBASSYRMB'); break;
            case RegionShard.WFE:                   this.#factbook      = txt(res, 'FACTBOOK'); break;
            case RegionShard.FLAG:                  this.#flag          = txt(res, 'FLAG'); break;
            case RegionShard.FOUNDED:               this.#founded       = txt(res, 'FOUNDED'); break;
            case RegionShard.FOUNDED_TIME:          this.#foundedtime   = parseInt(res, 'FOUNDEDTIME'); break;
            case RegionShard.FOUNDER:               this.#founder       = txt(res, 'FOUNDER'); break;
            case RegionShard.FOUNDER_AUTHORITY:     this.#founderauth   = txt(res, 'FOUNDERAUTH')?.split(/(?=[\s\S])/gu); break;
            case RegionShard.LAST_UPDATE:           this.#lastupdate    = num(res, 'LASTUPDATE'); break;
            case RegionShard.NAME:                  this.#name          = txt(res, 'NAME'); break;
            case RegionShard.NATIONS:               this.#nations       = txt(res, 'NATIONS')?.split(/\:/gm); break;
            case RegionShard.NUM_NATIONS:           this.#numnations    = num(res, 'NUMNATIONS'); break;
            case RegionShard.POWER:                 this.#power         = txt(res, 'POWER'); break;
            case RegionShard.TAGS:                  this.#tags          = txtArr(res['TAGS'], 'TAG'); break;

            /* ===== Object properties ===== */

            case RegionShard.CENSUS:
                this.#census = census(res['CENSUS']);
                break;
            case RegionShard.CENSUS_RANKS:
                this.#censusranks = censusRanks(res['CENSUSRANKS']);
                break;
            case RegionShard.EMBASSIES:
                let embassyC = res['EMBASSIES'];
                if(embassyC?.length == 1) {
                    this.#embassies = {
                        extant: [],
                        invited: [],
                        requested: [],
                        denied: [],
                        closing: [],
                        opening: []
                    };
                    for(let embassy of embassyC[0]['EMBASSY']) {
                        if(embassy['$']?.type == 'invited') this.#embassies.invited.push(embassy._);
                        else if(embassy['$']?.type == 'requested') this.#embassies.requested.push(embassy._);
                        else if(embassy['$']?.type == 'pending') this.#embassies.opening.push(embassy._);
                        else if(embassy['$']?.type == 'closing') this.#embassies.closing.push(embassy._);
                        else if(embassy['$']?.type == 'denied') this.#embassies.denied.push(embassy._);
                        else this.#embassies.push(embassy);
                    }
                }
                break;
            case RegionShard.HAPPENINGS:
                this.#happenings = happenings(res['HAPPENINGS']);
                break;
            case RegionShard.HISTORY:
                this.#history = happenings(res['HISTORY']);
                break;
            case RegionShard.MOST_RMB_POSTS:
                let mostpostsC = res['MOSTPOSTS'];
                if(mostpostsC?.length == 1) {
                    this.#mostposts = [];
                    for(let poster of mostpostsC[0]['NATION']) this.#mostposts.push({
                        nation: txt(poster, 'NAME'),
                        posts: num(poster, 'POSTS')
                    });
                    this.#mostposts.sort((a, b) => a.posts - b.posts);
                }
                break;
            case RegionShard.MOST_RMB_LIKES_RECEIVED:
                let mostlikedC = res['MOSTLIKED'];
                if(mostlikedC?.length == 1) {
                    this.#mostliked = [];
                    for(let receiver of mostlikedC[0]['NATION']) this.#mostliked.push({
                        nation: txt(receiver, 'NAME'),
                        likes: num(receiver, 'LIKED')
                    });
                    this.#mostliked.sort((a, b) => a.likes - b.likes);
                }
                break;
            case RegionShard.MOST_RMB_LIKES_GIVEN:
                let mostlikesC = res['MOSTLIKED'];
                if(mostlikesC?.length == 1) {
                    this.#mostlikes = [];
                    for(let receiver of mostlikesC[0]['NATION']) this.#mostlikes.push({
                        nation: txt(receiver, 'NAME'),
                        likes: num(receiver, 'LIKES')
                    });
                    this.#mostlikes.sort((a, b) => a.likes - b.likes);
                }
                break;
            case RegionShard.RMB_MESSAGES:
                let messageC = res['MESSAGES'];
                if(messageC?.length == 1) {
                    this.#messages = [];
                    for(let post of messageC[0]['POST']) this.#messages.push({
                        id: post['$']?.id,
                        timestamp: num(post, 'TIMESTAMP'),
                        edited: num(post, 'EDITED'),
                        author: txt(post, 'NATION'),
                        embassy: txt(post, 'EMBASSY'),
                        status: num(post, 'STATUS'),
                        suppressor: txt(post, 'SUPPRESSOR'),
                        likers: txt(post, 'LIKERS')?.split(/\,/gm) || [],
                        text: txt(post, 'MESSAGE')
                    });
                }
            case RegionShard.OFFICERS:
                let officerC = res['OFFICERS'];
                if(officerC?.length == 1) {
                    /** @private */
                    this.#officers = [];
                    for(let officer of officerC[0]['OFFICER']) this.#officers.push({
                        name: txt(officer, 'NATION'),
                        office: txt(officer, 'OFFICE'),
                        authority: txt(officer, 'AUTHORITY')?.split(/(?=[\s\S])/gu) || [],
                        appointed: num(officer, 'TIME'),
                        appointer: txt(officer, 'BY'),
                        position: num(officer, 'ORDER')
                    });
                    this.#officers.sort((a, b) => a.position - b.position);
                }
                break;
            case RegionShard.POLL:
                this.#poll = poll(res['POLL']);
                break;
            case RegionShard.WA_BADGES:
                this.#wabadges = waBadges(res['WABADGES']);
                break;
            case RegionShard.VOTE_GA:
                let ga = res['GAVOTE'];
                if(ga?.length == 1) this.#gavote = {
                    a: num(ga[0], 'FOR'),
                    f: num(ga[0], 'AGAINST')
                }
                break;
            case RegionShard.VOTE_SC:
                let sc = ['SCVOTE'];
                if(sc?.length == 1) this.#scvote = {
                    a: num(sc[0], 'FOR'),
                    f: num(sc[0], 'AGAINST')
                }
                break;
        }
    }

    /** ID of this region's regional banner. */
    get banner()            { return this.#banner }
    /** Name of the nation that uploaded this region's banner. */
    get bannerCreator()     { return this.#bannerby }
    /** List of average regional performance on the requested scales. */
    get censusScores()      { return this.#census }
    /** Rankings of regional nations on the requested census scale. */
    get censusRanks()       { return this.#censusranks }
    /** This region's ID in the NS database. */
    get databaseID()        { return this.#dbid }
    /** Name of this region's WA Delegate. */
    get delegate()          { return this.#delegate }
    /** Full list of powers granted to this region's Delegate. */
    get delegateAuthority() { return this.#delegateauth }
    /** How many votes this region's Delegate has in the WA. */
    get delegateWAWeight()  { return this.#delegatevotes }
    /** Full list of the IDs of the dispatches pinned to this region. */
    get pinnedDispatchIDs() { return this.#dispatches }
    /** Full list of embassies of this region, including proposed, shortly denied, pending, and closing ones. */
    get embassies()         { return this.#embassies }
    /** The cross-embassy RMB posting policy of this region. */
    get embassyRMBPosting() { return this.#embassyrmb }
    /** URL of this region's flag on the NS servers. */
    get flag()              { return this.#flag }
    /** Written description of when this region was founded. */
    get founded()           { return this.#founded }
    /** Unix timestamp of when this region was founded. */
    get foundedTime()       { return this.#foundedtime }
    /** Name of this region's Founder. */
    get founder()           { return this.#founder }
    /** Full list of powers granted to this region's founder. */
    get founderAuthority()  { return this.#founderauth }
    /** List of regional happenings. */
    get happenings()        { return this.#happenings }
    /** Full list of this region's important historical happenings. */
    get history()           { return this.#history }
    /** Unix timestamp of when this region last updated. */
    get lastUpdate()        { return this.#lastupdate }
    /** This region's name. */
    get name()              { return this.#name }
    /** Names of all nations residing in this region. */
    get nations()           { return this.#nations }
    /** Count of nations residing in this region. */
    get numNations()        { return this.#numnations || this.nations.length }
    /** Full list of regional officers of this region. */
    get officers()          { return this.#officers }
    /** The poll currently running in this region. */
    get poll()              { return this.#poll }
    /** Written description of this region's influence levels. */
    get power()             { return this.#power }
    /** List of messages lodged to this region's RMB. */
    get rmb()               { return this.#messages }
    /** List of which nations have made the most posts on this region's RMB. */
    get rmbTopPosters()     { return this.#mostposts }
    /** List of which nations have received the most likes on this region's RMB. */
    get rmbTopLiked()       { return this.#mostliked }
    /** List of which nations have given out the most likes on this region's RMB. */
    get rmbTopLikers()      { return this.#mostlikes }
    /** Full list of regional tags on this region. */
    get tags()              { return this.#tags }
    /** The tally of how this region's residents have voted in the GA. */
    get tallyGA()           { return this.#gavote }
    /** The tally of how this region's residents have voted in the SC. */
    get tallySC()           { return this.#scvote }
    /** The badges of commendation, condemnation, and liberation this region has received. */
    get waBadges()          { return this.#wabadges }
    /** World Factbook Entry for this region. */
    get wfe()               { return this.#factbook }
}

class World {
    /* Shards Supported: */
    #banners;
    #census;
    #censusdesc;
    #censusname;
    #censusranks;
    #censusscale;
    #censustitle;
    #censusid;
    #dispatch;
    #dispatchlist;
    #featuredregion;
    #happenings;
    #lasteventid;
    #nations;
    #newnations;
    #numnations;
    #numregions;
    #poll;
    #regions;
    #regionsbytag;
    #tgqueue;

    constructor(req, res) {
        for(let shard of req.getShards()) switch(shard) {

            /* ===== Primitive properties ===== */

            case WorldShard.CENSUS_ID:      this.#censusid          = txt(res, 'CENSUSID'); break;
            case WorldShard.CENSUS_NAME:    this.#censusname        = txt(res, 'CENSUS', req.getShards().includes(WorldShard.CENSUS) ? 1 : 0); break;
            case WorldShard.CENSUS_RANKS:   this.#censusranks       = censusRanks(res['CENSUSRANKS']); break;
            case WorldShard.CENSUS_SCALE:   this.#censusscale       = txt(res, 'CENSUSSCALE'); break;
            case WorldShard.CENSUS_TITLE:   this.#censustitle       = txt(res, 'CENSUSTITLE'); break;
            case WorldShard.FEATURED_REGION:this.#featuredregion    = txt(res, 'FEATUREDREGION'); break;
            case WorldShard.LAST_EVENT_ID:  this.#lasteventid       = num(res, 'LASTEVENTID'); break;
            case WorldShard.NATIONS:        this.#nations           = txt(res, 'NATIONS')?.split(/\,/gm); break;
            case WorldShard.NEW_NATIONS:    this.#newnations        = txt(res, 'NEWNATIONS')?.split(/\,/gm); break;
            case WorldShard.NUM_NATIONS:    this.#numnations        = num(res, 'NUMNATIONS'); break;
            case WorldShard.NUM_REGIONS:    this.#numregions        = num(res, 'NUMREGIONS'); break;
            case WorldShard.REGIONS:        this.#regions           = txt(res, 'REGIONS', 0)?.split(/\,/gm); break;
            case WorldShard.REGIONS_BY_TAG: this.#regionsbytag      = txt(res, 'REGIONS', req.getShards().includes(WorldShard.REGIONS) ? 1 : 0)?.split(/\,/gm); break;

            /* ===== Object properties ===== */

            case WorldShard.DISPATCH:
                this.#dispatch = new Dispatch(res['DISPATCH']?.[0]);
                break;
            case WorldShard.DISPATCH_LIST:
                this.#dispatchlist = dispatchlist(res['DISPATCHLIST'], false);
                break;
            case WorldShard.BANNER:
                let bannerC = res['BANNERS'];
                if(bannerC?.length == 1) {
                    this.#banners = [];
                    for(let banner of bannerC[0]['BANNER']) this.#banners.push({
                        id: banner['$'].id,
                        name: txt(banner, 'NAME'),
                        prerequisite: txt(banner, 'VALIDITY')
                    });
                }
                break;
            case WorldShard.CENSUS:
                this.#census = census(res['CENSUS']);
                break;
            case WorldShard.CENSUS_DESCRIPTION:
                let descC = res['CENSUSDESC'];
                if(descC?.length == 1) this.#censusdesc = {
                    id: descC[0]['$'].id,
                    national: txt(descC[0], 'NDESC'),
                    regional: txt(descC[0], 'RDESC')
                }
                break;
            case WorldShard.HAPPENINGS:
                this.#happenings = happenings(res['HAPPENINGS']);
                break;
            case WorldShard.POLL:
                this.#poll = poll(res['POLL']);
                break;
            case WorldShard.TG_QUEUE:
                let queueC = res['TGQUEUE'];
                if(queueC?.length == 1) this.#tgqueue = {
                    manual: num(queueC[0], 'MANUAL'),
                    mass: num(queueC[0], 'MASS'),
                    api: num(queueC[0], 'API')
                }
                break;
        }
    }

    /** Details of the requested banners. */
    get banners()           { return this.#banners }
    /** List of average worldwide performance on the requested census scales. */
    get census()            { return this.#census }
    /** Introductory texts to the requested census scale's ranking for nations and regions respectively. */
    get censusDescriptor()  { return this.#censusdesc }
    /** Written description of what the requested census scale ranks. */
    get censusName()        { return this.#censusname }
    /** Rankings of nations on the requested census scale. */
    get censusRanks()       { return this.#censusranks }
    /** Name of the scale the requested census is measured on. */
    get censusScaleName()   { return this.#censusscale }
    /** Title of the requested census scale. */
    get censusTitle()       { return this.#censustitle }
    /** ID of the day's featured census scale. */
    get dailyCensusID()     { return this.#censusid }
    /** The dispatch with the requested ID. */
    get dispatch()          { return this.#dispatch }
    /** List of dispatches meeting the requested criteria. */
    get dispatchList()      { return this.#dispatchlist }
    /** Name of the day's featured region. */
    get featuredRegion()    { return this.#featuredregion }
    /** List of happenings meeting the requested criteria. */
    get happenings()        { return this.#happenings }
    /** ID of the last happening visible via the API. */
    get lastEventID()       { return this.#lasteventid }
    /** List of the names of all nations. */
    get nations()           { return this.#nations }
    /** List of the 50 most recently founded nations. */
    get newNations()        { return this.#newnations }
    /** Count of currently existing nations. */
    get numNations()        { return this.#numnations || this.nations.length }
    /** Count of currently existing regions. */
    get numRegions()        { return this.#numregions || this.regions.length }
    /** The requested poll. */
    get poll()              { return this.#poll }
    /** List of the names of all regions. */
    get regions()           { return this.#regions }
    /** Full list of all regions fulfilling the requested tag requirements. */
    get tagSearchResults()  { return this.#regionsbytag }
    /** How many telegrams are currently in each of the three queues. */
    get telegramQueue()     { return this.#tgqueue }
}

class WorldAssembly {
    /* Shards Supported: */
    #delegates;
    #lastres;
    #members;
    #numnations;
    #numdelegates;
    #happenings;
    #proposals;
    #resolution;
    #dellog;
    #votetrack;
    #voters;
    #delvotes;

    constructor(req, res) {
        for(let shard of req.getShards()) switch(shard) {

            /* ===== Primitive properties ===== */

            case WAShard.DELEGATES:         this.#delegates     = txt(res, 'DELEGATES')?.split(/\,/gm); break;
            case WAShard.LAST_RESOLUTION:   this.#lastres       = txt(res, 'LASTRESOLUTION'); break;
            case WAShard.MEMBERS:           this.#members       = txt(res, 'MEMBERS')?.split(/\,/gm); break;
            case WAShard.NUM_MEMBERS:       this.#numnations    = num(res, 'NUMNATIONS'); break;
            case WAShard.NUM_DELEGATES:     this.#numdelegates  = num(res, 'NUMDELEGATES'); break;

            /* ===== Object properties ===== */
            
            case WAShard.HAPPENINGS:
                this.#happenings = happenings(res['HAPPENINGS']);
                break;
            case WAShard.PROPOSALS:
                let proposalC = res['PROPOSALS'];
                if(proposalC?.length == 1) {
                    this.#proposals = [];
                    for(let proposal of proposalC[0]['PROPOSAL']) this.#proposals.push(new WAProposal(proposal, res['$']?.council));
                }
                break;
            case WAShard.RESOLUTION_AT_VOTE:
                let resolutionC = res['RESOLUTION'];
                if(resolutionC?.length == 1) this.#resolution = new WAProposal(resolutionC[0], res['$']?.council);
                break;
            case WAShard.DELEGATE_VOTE_LOG:
                let dellogC = res['DELLOG'];
                if(dellogC?.length == 1) {
                    this.#dellog = [];
                    for(let entry of dellogC[0]['ENTRY']) this.#dellog.push({
                        timestamp: num(entry, 'TIMESTAMP'),
                        delegate: txt(entry, 'NATION'),
                        action: txt(entry, 'ACTION'),
                        numVotes: num(entry, 'VOTES')
                    });
                }
                break;
            case WAShard.VOTE_TRACK:
                let trackF = res['VOTE_TRACK_FOR'], trackA = res['VOTE_TRACK_AGAINST'];
                if(trackF?.length == 1 && trackA?.length == 1) {
                    this.#votetrack = [];
                    let arrF = txtArr(trackF, 'N'), arrA = txtArr(trackA, 'N');
                    for(let i = 0; i < arrF.length; i++) this.#votetrack.push({
                        a: parseInt(arrA[i]),
                        f: parseInt(arrF[i])
                    });
                }
                break;
            case WAShard.VOTERS:
                let votersF = res['VOTES_FOR'], votersA = res['VOTES_AGAINST'];
                if(votersA?.length == 1 && votersF?.length == 1) this.#voters = {
                    a: txtArr(votersA, 'N'),
                    f: txtArr(votersF, 'N')
                }
                break;
            case WAShard.DELEGATE_VOTES:
                let delF = res['DELVOTES_FOR'], delA = res['DELVOTES_AGAINST'];
                if(delF?.length == 1 && delA?.length == 1) {
                    let delArrF = [], delArrA = [];
                    for(let del of delF[0]['DELEGATE']) delArrF.push({
                        delegate: txt(del, 'NATION'),
                        weight: num(del, 'VOTES'),
                        cast: num(del, 'TIMESTAMP')
                    });
                    for(let del of delA[0]['DELEGATE']) delArrA.push({
                        delegate: txt(del, 'NATION'),
                        weight: num(del, 'VOTES'),
                        cast: num(del, 'TIMESTAMP')
                    });
                    this.#delvotes = {
                        a: delArrA,
                        f: delArrF
                    }
                }
                break;
        }
        this.#council       = res['$'].council;
    }

    /** Full list of the names of all WA delegates. */
    get delegates()         { return this.#delegates }
    /** Written description of the voting result on the last resolution. */
    get lastResolution()    { return this.#lastres }
    /** Full list of the names of all WA members. */
    get members()           { return this.#members }
    /** Count of WA members. */
    get numMembers()        { return this.#numnations || this.members.length }
    /** Count of WA delegates. */
    get numDelegates()      { return this.#numdelegates || this.delegates.length }
    /** List of WA happenings. */
    get happenings()        { return this.#happenings }
    /** Full list of current proposals. */
    get proposals()         { return this.#proposals }
    /** Details of the at-vote resolution. */
    get resolutionAtVote()  { return this.#resolution }
    /** Full chronological list of delegates casting their votes on the at-vote resolution. */
    get trackDelegates()    { return this.#dellog }
    /** Full chronological list of hourly total For/Against tally for the at-vote resolution. */
    get trackTally()        { return this.#votetrack }
    /** Full list of individual nations' votes by stance on the at-vote resolution. */
    get voters()            { return this.#voters }
    /** Full list of delegates' votes by stance on the at-vote resolution. */
    get votersDelegates()   { return this.#delvotes }

    #council;
    /** Which of the WA councils the fetched data is about. */
    get council()           { return this.#council }
}

class Dispatch {
    #id;
    #title;
    #author;
    #category;
    #created;
    #edited;
    #views;
    #score;
    #text;

    constructor(base) {
        this.#id        = base['$'].id;
        this.#title     = txt(base, 'TITLE');
        this.#author    = txt(base, 'AUTHOR');
        this.#category  = `${txt(base, 'CATEGORY')}:${txt(base, 'SUBCATEGORY')}`;
        this.#created   = num(base, 'CREATED');
        this.#edited    = num(base, 'EDITED');
        this.#views     = num(base, 'VIEWS');
        this.#score     = num(base, 'SCORE');
        this.#text      = txt(base, 'TEXT');
    }

    get id()        { return this.#id }
    get title()     { return this.#title }
    get author()    { return this.#author }
    get category()  { return this.#category }
    get created()   { return this.#created }
    get edited()    { return this.#edited }
    get views()     { return this.#views }
    get score()     { return this.#score }
    get text()      { return this.#text }
}

class WAProposal {
    #id;
    #council;
    #approvals;
    #proposedBy;
    #coauthors;
    #category;
    #option;
    #created;
    #desc;
    #name;
    #promoted;
    #votes;
    #legality;

    constructor(base, councilID) {
        this.#id = txt(base, 'ID');
        this.#council = parseInt(councilID);
        this.#approvals = txt(base, 'APPROVALS')?.split(/\:/gm) || [];
        this.#proposedBy = txt(base, 'PROPOSED_BY');
        this.#coauthors = txtArr(base['COAUTHOR'], 'N') || [];
        this.#category = txt(base, 'CATEGORY');
        this.#created = num(base, 'CREATED');
        this.#desc = txt(base, 'DESC');
        this.#name = txt(base, 'NAME');
        this.#option = txt(base, 'OPTION');
        this.#promoted = num(base, 'PROMOTED');
        this.#votes = this.#promoted == undefined ? undefined : {
            tallyFor: num(base, 'TOTAL_VOTES_FOR'),
            nationsFor: num(base, 'TOTAL_NATIONS_FOR'),
            tallyAgainst: num(base, 'TOTAL_VOTES_AGAINST'),
            nationsAgainst: num(base, 'TOTAL_NATIONS_AGAINST')
        };
        let baseLegal = base['GENSEC'];
        if(baseLegal?.length == 1) {
            let log = [];
            for(let e of baseLegal[0]['LOG'][0]['ENTRY']) log.push({
                member: txt(e, 'NATION'),
                vote: txt(e, 'DECISION'),
                reason: txt(e, 'REASON'),
                timestamp: num(e, 'T')
            });
            this.#legality = {
                legal: txtArr(baseLegal[0]['LEGAL'], 'LEGAL'),
                illegal: txtArr(baseLegal[0]['ILLEGAL'], 'ILLEGAL'),
                discard: txtArr(baseLegal[0]['DISCARD'], 'DISCARD')
            };
        }
    }

    get id()            { return this.#id }
    get council()       { return this.#council }
    get approvals()     { return this.#approvals }
    get author()        { return this.#proposedBy }
    get coauthors()     { return this.#coauthors }
    get category()      { return this.#category }
    get submitted()     { return this.#created }
    get text()          { return this.#desc }
    get title()         { return this.#name }
    get option()        { return this.#option }
    get votingStarted() { return this.#promoted }
    get votes()         { return this.#votes }
    get legality()      { return this.#legality }
}

class AnsweredIssue {
    #headlines;
    #reclassifications;
    #unlocks;
    #rankings;
    #ok;
    #desc;
    #policies;

    constructor(res) {
        this.#ok        = num(res, 'OK') == 1;
        this.#desc      = txt(res, 'DESC');
        this.#headlines = txtArr(res['HEADLINES'], 'HEADLINE');

        this.#policies  = {
            added: policies(res['NEW_POLICIES']),
            removed: policies(res['REMOVED_POLICIES'])
        }

        let unlocksC = res['UNLOCKS'];
        if(unlocksC?.length == 1) this.#unlocks       = {
            banners: txtArr(unlocksC, 'BANNER')
        }
        
        let reclassificationsC = res['RECLASSIFICATIONS'];
        if(reclassificationsC?.length == 1) {
            let civ, eco, pol;
            for(let reclassify of reclassificationsC[0]['RECLASSIFY']) {
                let type = reclassify['$']?.type;
                if(type == '0') civ = {
                    from: txt(reclassify, 'FROM'),
                    to: txt(reclassify, 'TO')
                };
                else if(type == '1') eco = {
                    from: txt(reclassify, 'FROM'),
                    to: txt(reclassify, 'TO')
                };
                else if(type == '2') pol = {
                    from: txt(reclassify, 'FROM'),
                    to: txt(reclassify, 'TO')
                };
            }
            this.#reclassifications = {
                civilRights: civ,
                economy: eco,
                politicalFreedom: pol
            }
        }

        let rankingsC = res['RANKINGS'];
        if(rankingsC?.length == 1) {
            this.#rankings = [];
            for(let rank of rankingsC[0]['RANK']) this.#rankings[rank['$']?.id] = {
                newScore: num(rank, 'SCORE'),
                rawChange: num(rank, 'CHANGE'),
                percentChange: num(rank, 'PCHANGE')
            };
        }
    }

    get ok()                { return this.#ok }
    get description()       { return this.#desc }
    get censusChanges()     { return this.#rankings }
    get unlocks()           { return this.#unlocks }
    get reclassifications() { return this.#reclassifications }
    get headlines()         { return this.#headlines }
    get policyChanges()     { return this.#policies }
}

exports.Nation          = Nation;
exports.Region          = Region;
exports.World           = World;
exports.WorldAssembly   = WorldAssembly;

exports.AnsweredIssue   = AnsweredIssue;
exports.WAProposal      = WAProposal;