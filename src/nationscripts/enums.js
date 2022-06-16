/*
 * A number of Enums containing relevant values for communicating with the NS API,
 * such as Shard names, Census Scale IDs, and Dispatch categories.
 */

/**
 * @enum
 */
exports.DispatchCategory = Object.freeze({
    FACTBOOK: 'Factbook',
    BULLETIN: 'Bulletin',
    ACCOUNT: 'Account',
    META: 'Meta'
});

/**
 * @enum
 */
exports.DispatchSubcategory = Object.freeze({
    FACTBOOK: {
        OVERVIEW:       `${this.DispatchCategory.FACTBOOK}:Overview`,
        HISTORY:        `${this.DispatchCategory.FACTBOOK}:History`,
        GEOGRAPHY:      `${this.DispatchCategory.FACTBOOK}:Geography`,
        CULTURE:        `${this.DispatchCategory.FACTBOOK}:Culture`,
        POLITICS:       `${this.DispatchCategory.FACTBOOK}:Politics`,
        LEGISLATION:    `${this.DispatchCategory.FACTBOOK}:Legislation`,
        RELIGION:       `${this.DispatchCategory.FACTBOOK}:Religion`,
        MILITARY:       `${this.DispatchCategory.FACTBOOK}:Military`,
        ECONOMY:        `${this.DispatchCategory.FACTBOOK}:Economy`,
        INTERNATIONAL:  `${this.DispatchCategory.FACTBOOK}:International`,
        TRIVIA:         `${this.DispatchCategory.FACTBOOK}:Trivia`,
        MISCELLANEOUS:  `${this.DispatchCategory.FACTBOOK}:Miscellaneous`
    },
    BULLETIN: {
        POLICY:     `${this.DispatchCategory.BULLETIN}:Policy`,
        NEWS:       `${this.DispatchCategory.BULLETIN}:News`,
        OPINION:    `${this.DispatchCategory.BULLETIN}:Opinion`,
        CAMPAIGN:   `${this.DispatchCategory.BULLETIN}:Campaign`
    },
    ACCOUNT: {
        MILITARY:   `${this.DispatchCategory.ACCOUNT}:Military`,
        TRADE:      `${this.DispatchCategory.ACCOUNT}:Trade`,
        SPORT:      `${this.DispatchCategory.ACCOUNT}:Sport`,
        DRAMA:      `${this.DispatchCategory.ACCOUNT}:Drama`,
        DIPLOMACY:  `${this.DispatchCategory.ACCOUNT}:Diplomacy`,
        SCIENCE:    `${this.DispatchCategory.ACCOUNT}:Science`,
        CULTURE:    `${this.DispatchCategory.ACCOUNT}:Culture`,
        OTHER:      `${this.DispatchCategory.ACCOUNT}:Other`
    },
    META: {
        GAMEPLAY:   `${this.DispatchCategory.META}:Gameplay`,
        REFERENCE:  `${this.DispatchCategory.META}:Reference`
    }
});

/**
 * @enum
 */
exports.DispatchSortMode = Object.freeze({
    NEW: 'new',
    BEST: 'best'
});

/**
 * @enum
 */
exports.HappeningsFilter = Object.freeze({
    LEGISLATION: 'law',
    NATION_CHANGES: 'change',
    DISPATCHES: 'dispatch',
    RMB: 'rmb',
    EMBASSIES: 'embassy',
    BORDER_CONTROL: 'eject',
    REGION_ADMIN: 'admin',
    MOVEMENT: 'move',
    FOUNDING: 'founding',
    CTE: 'cte',
    WA_VOTES: 'vote',
    WA_PROPOSALS: 'resolution',
    WA_MEMBERSHIP: 'member',
    ENDORSEMENTS: 'endo'
});

/**
 * @enum
 */
exports.NoticeType = Object.freeze({
    ENDORSEMENT_GAINED: 'END',
    CENSUS_RANK_GAINED: 'T',
    DISPATCH_MENTION: 'D',
    UNLOCK: 'U',
    CARDS: 'C'
});

/**
 * @enum
 */
exports.CensusMode = Object.freeze({
    SCORE: 'score',
    RANK_REGION: 'rrank',
    RANK_REGION_PERCENT: 'prrank',
    RANK_WORLD: 'rank',
    RANK_WORLD_PERCENT: 'prank'
});
/**
 * @enum
 */
exports.CensusScale = Object.freeze({
    CIVIL_RIGHTS: 0,
    ECONOMY: 1,
    POLITICAL_FREEDOM: 2,
    POPULATION: 3,
    WEALTH_GAPS: 4,
    DEATH_RATE: 5,
    COMPASSION: 6,
    ECO_FRIENDLINESS: 7,
    SOCIAL_CONSERVATISM: 8,
    NUDITY: 9,
    I_AUTOMOBILE: 10,
    I_CHEESE: 11,
    I_BASKET: 12,
    I_IT: 13,
    I_PIZZA: 14,
    I_TROUT: 15,
    I_ARMS: 16,
    S_AGRICULTURE: 17,
    I_BEVERAGE: 18,
    I_TIMBER: 19,
    I_MINING: 20,
    I_INSURANCE: 21,
    I_FURNITURE: 22,
    I_RETAIL: 23,
    I_BOOK: 24,
    I_GAMBLING: 25,
    S_MANUFACTURING: 26,
    GOVERNMENT_SIZE: 27,
	WELFARE: 28,
	PUBLIC_HEALTHCARE: 29,
	LAW_ENFORCEMENT: 30,
	BUSINESS_SUBSIDIZATION: 31,
	RELIGIOUSNESS: 32,
	INCOME_EQUALITY: 33,
	NICENESS: 34,
	RUDENESS: 35,
	INTELLIGENCE: 36,
	IGNORANCE: 37,
	POLITICAL_APATHY: 38,
	HEALTH: 39,
	CHEERFULNESS: 40,
	WEATHER: 41,
	COMPLIANCE: 42,
	SAFETY: 43,
	LIFESPAN: 44,
	IDEOLOGICAL_RADICALITY: 45,
	DEFENSE_FORCES: 46,
	PACIFISM: 47,
	ECONOMIC_FREEDOM: 48,
	TAXATION: 49,
	FREEDOM_FROM_TAXATION: 50,
	CORRUPTION: 51,
	INTEGRITY: 52,
	AUTHORITARIANISM: 53,
	YOUTH_REBELLIOUSNESS: 54,
	CULTURE: 55,
	EMPLOYMENT: 56,
	PUBLIC_TRANSPORT: 57,
	TOURISM: 58,
	WEAPONIZATION: 59,
	RECREATIONAL_DRUG_USE: 60,
	OBESITY: 61,
	SECULARISM: 62,
	ENVIRONMENTAL_BEAUTY: 63,
	CHARMLESSNESS: 64,
	INFLUENCE: 65,
	WORLD_ASSEMBLY_ENDORSEMENTS: 66,
	AVERAGENESS: 67,
	HUMAN_DEVELOPMENT_INDEX: 68,
	PRIMITIVENESS: 69,
	SCIENTIFIC_ADVANCEMENT: 70,
	INCLUSIVENESS: 71,
	AVERAGE_INCOME: 72,
	AVERAGE_INCOME_POOR: 73,
	AVERAGE_INCOME_RICH: 74,
	PUBLIC_EDUCATION: 75,
	ECONOMIC_OUTPUT: 76,
	CRIME: 77,
	FOREIGN_AID: 78,
	BLACK_MARKET: 79,
	RESIDENCY: 80,
	SURVIVORS: 81,
	ZOMBIES: 82,
	DEAD: 83,
	PERCENTAGE_ZOMBIES: 84,
	AVERAGE_DISPOSABLE_INCOME: 85,
	INTERNATIONAL_ARTWORK: 86,
	PATRIOTISM: 87,
	FOOD_QUALITY: 88
});

/**
 * @enum
 */
exports.DeathCause = Object.freeze({
    ACCIDENT: 'Accident',
    ANIMAL_ATTACK: 'Animal Attack',
    AGE: 'Old Age',
    BUNGEE_JUMPING: 'Bungee Jumping',
    CANCER: 'Cancer',
    CAPITAL_PUNISHMENT: 'Capital Punishment',
    DISAPPEARANCE: 'Disappearance',
    EUTHANASIA: 'Involuntary Euthanasia',
    EXPOSURE: 'Exposure',
    GOD: 'Acts of God',
    HEART_DISEASE: 'Heart Disease',
    MALNOURISHMENT: 'Malnourishment',
    MURDER: 'Murder',
    SACRIFICE: 'Ritual Sacrifice',
    SCURVY: 'Scurvy',
    SHUTTLE_MISHAP: 'Space Shuttle Mishap',
    SPILL: 'Nuclear Spill',
    SUICIDE: 'Suicide While in Police Custody',
    SUNBURN: 'Sunburn',
    VAT_LEAKAGE: 'Vat Leakage',
    WAR: 'War',
    WILDERNESS: 'Lost in Wilderness',
    WORK: 'Work'
});

/**
 * @enum
 */
exports.EmbassyRMBPosting = Object.freeze({
    NONE: '0',
    DELEGATES_AND_FOUNDERS: 'con',
    OFFICERS: 'off',
    OFFICERS_WITH_COMMS: 'com',
    EVERYONE: 'all'
});

/**
 * @enum
 */
exports.OfficerAuthority = Object.freeze({
    EXECUTIVE: 'X',
    WA: 'W',
    APPEARANCE: 'A',
    BORDER_CONTROL: 'B',
    COMMS: 'C',
    EMBASSIES: 'E',
    POLLS: 'P'
});

/**
 * @enum
 */
exports.RMBPostStatus = Object.freeze({
    OK: 0,
    SUPPRESSED_OFFICER: 1,
    DELETED: 2,
    SUPPRESSED_MOD: 9
});

/**
 * @enum
 */
exports.SpendingArea = Object.freeze({
    ADMIN: 'Administration',
    DEFENSE: 'Defense',
    EDUCATION: 'Education',
    ENVIRONMENT: 'Environment',
    HEALTH: 'Healthcare',
    INDUSTRY: 'Commerce',
    AID: 'International Aid',
    LAW: 'Law & Order',
    TRANSPORT: 'Public Transport',
    SOCIAL: 'Social Policy',
    SPIRITUALITY: 'Spirituality',
    WELFARE: 'Welfare'
});

/**
 * @enum
 */
exports.WAStatus = Object.freeze({
    NONMEMBER: 'Non-member',
    MEMBER: 'WA Member',
    DELEGATE: 'WA Delegate'
});
/**
 * @enum
 */
exports.WACouncil = Object.freeze({
    GA: 1,
    SC: 2
});
/**
 * @enum
 */
exports.WAVote = Object.freeze({
    FOR: 'FOR',
    AGAINST: 'AGAINST',
    UNDECIDED: 'UNDECIDED',
    NONE_AT_VOTE: ''
});
/**
 * @enum
 */
exports.WABadge = Object.freeze({
    COMMENDATION: 'commend',
    CONDEMNATION: 'condemn'
});
/**
 * @enum
 */
exports.WACategory = Object.freeze({
    GA: {},
    SC: {}
});

/**
 * @enum
 */
exports.NationShard = Object.freeze({
    ADMIRABLE: 'admirable',
    ADMIRABLES: 'admirables',
    ANIMAL: 'animal',
    ANIMAL_TRAIT: 'animaltrait',
    BANNER: 'banner',
    BANNERS: 'banners',
    CAPITAL: 'capital',
    CATEGORY: 'category',
    CENSUS: 'census',
    CENSUS_RANK: 'wcensus',
    CRIME: 'crime',
    CURRENCY: 'currency',
    CUSTOM_CAPITAL: 'customcapital',
    CUSTOM_LEADER: 'customleader',
    CUSTOM_RELIGION: 'customreligion',
    DATABASE_ID: 'dbid',
    DEATHS: 'deaths',
    DEMONYM_ADJECTIVE: 'demonym',
    DEMONYM_NOUN: 'demonym2',
    DEMONYM_NOUN_PLURAL: 'demonym2plural',
    DISPATCHES: 'dispatches',
    DISPATCH_LIST: 'dispatchlist',
    ENDORSEMENTS: 'endorsements',
    FACTBOOKS: 'factbooks',
    FACTBOOK_LIST: 'factbooklist',
    FIRST_LOGIN: 'firstlogin',
    FLAG: 'flag',
    FOUNDED: 'founded',
    FOUNDED_TIME: 'foundedtime',
    FREEDOM: 'freedom',
    FULL_NAME: 'fullname',
    GDP: 'gdp',
    GOVERNMENT_DESCRIPTION: 'govtdesc',
    GOVERNMENT_PRIORITY: 'govtpriority',
    GOVERNMENT_SPENDING: 'govt',
    HAPPENINGS: 'happenings',
    INCOME: 'income',
    INCOME_POOREST: 'poorest',
    INCOME_RICHEST: 'richest',
    INDUSTRY_DESCRIPTION: 'indsutrydesc',
    INFLUENCE: 'influence',
    ISSUES_ANSWERED: 'answered',
    LAST_ACTIVITY: 'lastactivity',
    LAST_LOGIN: 'lastlogin',
    LEADER: 'leader',
    LEGISLATION: 'legislation',
    MAJOR_INDUSTRY: 'majorindustry',
    MOTTO: 'motto',
    NAME: 'name',
    NOTABLE: 'notable',
    NOTABLES: 'notables',
    POLICIES: 'policies',
    POPULATION: 'population',
    PUBLIC_SECTOR: 'publicsector',
    REGION: 'region',
    REGIONAL_CENSUS: 'rcensus',
    RELIGION: 'religion',
    SECTORS: 'sectors',
    SENSIBILITIES: 'sensibilities',
    TAX: 'tax',
    TG_RECRUITABLE: 'tgcanrecruit',
    TG_CAMPAIGNABLE: 'tgcancampaign',
    TYPE: 'type',
    WA_STATUS: 'wa',
    WA_BADGES: 'wabadges',
    WORLD_CENSUS: 'wcensus',
    VOTE_GA: 'gavote',
    VOTE_SC: 'scvote',

    /**
     * **Undocumented.** Makeup of the calculation of the nation's HDI score.
     */
    HDI: 'hdi'
});
/**
 * @enum
 */
exports.NationPrivateShard = Object.freeze({
    DOSSIER_NATIONS: 'dossier',
    DOSSIER_REGIONS: 'rdossier',
    ISSUES: 'issues',
    ISSUES_SUMMARY: 'issuesummary',
    NEXT_ISSUE: 'nextissue',
    NEXT_ISSUE_TIME: 'nextissuetime',
    NOTICES: 'notices',
    PACKS: 'packs',
    PING: 'ping',
    UNREADS: 'unread'
});

/**
 * @enum
 */
exports.RegionShard = Object.freeze({
    BANNER: 'banner',
    BANNER_CREATOR: 'bannerby',
    CENSUS: 'census',
    CENSUS_RANKS: 'censusranks',
    DATABASE_ID: 'dbid',
    DELEGATE: 'delegate',
    DELEGATE_AUTHORITY: 'delegateauth',
    DELEGATE_VOTE_WEIGHT: 'delegatevotes',
    DISPATCHES: 'dispatches',
    EMBASSIES: 'embassies',
    EMBASSY_RMB_POSTING: 'embassyrmb',
    FLAG: 'flag',
    FOUNDED: 'founded',
    FOUNDED_TIME: 'foundedtime',
    FOUNDER: 'founder',
    FOUNDER_AUTHORITY: 'founderauth',
    HAPPENINGS: 'happenings',
    HISTORY: 'history',
    LAST_UPDATE: 'lastupdate',
    NAME: 'name',
    NATIONS: 'nations',
    NUM_NATIONS: 'numnations',
    OFFICERS: 'officers',
    POLL: 'poll',
    POWER: 'power',
    RMB_MESSAGES: 'messages',
    TAGS: 'tags',
    VOTE_GA: 'gavote',
    VOTE_SC: 'scvote',
    WA_BADGES: 'wabadges',
    WFE: 'factbook',

    /**
     * **Undocumented.** Get the names of nations that have made the most posts to the region's RMB.
     */
    MOST_RMB_POSTS: 'mostposts',
    /**
     * **Undocumented.** Get the names of nations that have given out the most likes on the region's RMB.
     */
    MOST_RMB_LIKES_GIVEN: 'mostlikes',
    /**
     * **Undocumented.** Get the names of nations that have received the most likes on the region's RMB.
     */
    MOST_RMB_LIKES_RECEIVED: 'mostliked'
});

/**
 * @enum
 */
exports.WorldShard = Object.freeze({
    BANNER: 'banner',
    CENSUS: 'census',
    CENSUS_ID: 'censusid',
    CENSUS_DESCRIPTION: 'censusdesc',
    CENSUS_NAME: 'censusname',
    CENSUS_RANKS: 'censusranks',
    CENSUS_SCALE: 'censusscale',
    CENSUS_TITLE: 'censustitle',
    DISPATCH: 'dispatch',
    DISPATCH_LIST: 'dispatchlist',
    FEATURED_REGION: 'featuredregion',
    HAPPENINGS: 'happenings',
    LAST_EVENT_ID: 'lasteventid',
    NATIONS: 'nations',
    NEW_NATIONS: 'newnations',
    NUM_NATIONS: 'numnations',
    NUM_REGIONS: 'numregions',
    POLL: 'poll',
    REGIONS: 'regions',
    REGIONS_BY_TAG: 'regionsbytag',
    TG_QUEUE: 'tgqueue'
});

/**
 * @enum
 */
exports.WAShard = Object.freeze({
    DELEGATES: 'delegates',
    DELEGATE_VOTES: 'delvotes',
    DELEGATE_VOTE_LOG: 'dellog',
    HAPPENINGS: 'happenings',
    LAST_RESOLUTION: 'lastresolution',
    MEMBERS: 'members',
    NUM_DELEGATES: 'numdelegates',
    NUM_MEMBERS: 'numnations',
    PROPOSALS: 'proposals',
    RESOLUTION_AT_VOTE: 'resolution',
    VOTERS: 'voters',
    VOTE_TRACK: 'votetrack'
});