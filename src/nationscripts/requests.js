const { NationShard, WorldShard, WAShard, DispatchCategory, DispatchSubcategory } = require('./enums');
const { APIInstanceError, AuthenticationError, MissingArgumentsError, NSError } = require('./exceptions');
const Responses = require('./responses');
/* const fetch = require('node-fetch'); */

const parser = new (require('xml2js').Parser)();

class NSCredential {
    /**
     * @type {string}
     */
    pwd;
    /**
     * @type {string}
     */
    auto;
    /**
     * @type {string}
     */
    pin;

    /**
     * @param {string} pwd 
     * @param {string} auto 
     * @param {number} pin 
     */
    constructor(pwd, auto, pin) {
        this.pwd = pwd;
        this.auto = auto;
        this.pin = pin;
    };

    /**
     * @param {Headers} headers
     */
    set fromHeaders(headers) {
        this.auto   = headers.get('X-autologin') || this.auto;
        this.pin    = headers.get('X-pin') || this.pin;
    }
}


class NSRequest {
    /**
     * @access private
     */
    #apiArgs = {};

    /**
     * @type {NSAPI}
     * @private
     */
    api;

    #requiredArgs = [];

    /**
     * 
     * @param {NSAPI} api 
     */
    constructor(api, ...required) {
        if(api) this.api = api;
        else throw new APIInstanceError();
        if(required) this.#requiredArgs = required;
    }

    args(key, ...values) {
        if(!key || !values) return this;
        this.#apiArgs[key] = values.join('+');
        return this;
    }
    getArguments() {
        return Object.keys(this.#apiArgs);
    }
    /**
     * 
     * @param {*} name 
     * @returns {string}
     */
    getArgument(name) {
        return this.#apiArgs[name];
    }
    appendArgument(name, value) {
        return this.#apiArgs[name] += value;
    }
    removeArgument(name) {
        if(this.#apiArgs[name]) {
            delete this.#apiArgs[name];
            return true;
        } else return false;
    }

    /**
     * @param {number} v
     */
    useVersion(v) {
        return this.args('v', v);
    }

    async send() {
        if(this.api) {
            // Verify that all required arguments are set
            let missing = [];
            for(let arg of this.#requiredArgs) if(!(this.getArgument(arg)?.length > 0)) missing.push(arg);
            if(missing.length > 0) throw new MissingArgumentsError(missing);

            let res = await this.api.sendRequest(this);
            if(res) {   // Try to parse the XML returned and check if it contains <ERROR> tags
                let xml = await parser.parseStringPromise(res);
                if(xml?.['ERROR']) throw new NSError(xml['ERROR'][0]);
                else return xml;
            }else throw new NSError('An unknown error occurred while contacting the NS API!');
        } else throw new APIInstanceError();
    }
}

class ShardableRequest extends NSRequest {
    constructor(api, ...required) {
        super(api, ...required);
    }
    
    shard(...shards) {
        return this.args('q', ...shards);
    }
    getShards() {
        return this.getArgument('q')?.split(/\+/g);
    }
    addShards(...shards) {
        return this.args('q', [...this.getShards(), ...shards])
    }
    requireShard(shard) {
        if(!this.getShards().includes(shard)) this.addShards(shard);
    }
}

class ShardableCensusRequest extends ShardableRequest {
    /**
     * 
     * @param {boolean} all Shortcut to request data from all scales. If `true`, the `scales` argument will not be taken into account.
     * @param  {...number} scales IDs of the desired World Census scales. The CensusScale object can be used to find scale IDs.
     */
    setCensusScale(all, ...scales) {
        if(all) return this.args('scale', 'all');
        else return this.args('scale', ...scales);
    }
    setCensusMode(...modes) {
        return this.args('mode', ...modes);
    }
    setCensusHistoryWindow(from, to) {
        return this
                .setHappeningsMode('history')   // History mode cannot be combined with other modes!
                .args('from', from)
                .args('to', to);
    }
}

class NationRequest extends ShardableCensusRequest {
    constructor(api, nname, ...required) {
        super(api, 'nation', ...required);
        this.args('nation', nname?.toLowerCase().replace(/ /g, '_'));
    }

    /**
     * @type {NSCredential}
     * @access protected
     */
    loginCredentials;
    authenticate(credential) {
        if(credential) this.loginCredentials = credential;
        return this;
    }

    setTGFrom(from) {
        if(!this.getShards().includes(NationShard.TG_CAMPAIGNABLE) &&
                !this.getShards().includes(NationShard.TG_RECRUITABLE))
            this.requireShard(NationShard.TG_RECRUITABLE);
        return this.args('from', from);
    }

    /**
     * @override
     */
    async send() {
        return new Responses.Nation((this, await super.send())['NATION']);
    }
}

class RegionRequest extends ShardableCensusRequest {
    constructor(api, rname) {
        super(api, 'region');
        this.args('region', rname?.toLowerCase().replace(/ /g, '_'));
    }
    setMessageOptions(limit, offset, fromID) {
        return this
                .setMessageLimit(limit)
                .setMessageOffset(offset)
                .setMessageStart(fromID);
    }
    setMessageLimit(limit) {
        return this.args('limit', limit);
    }
    setMessageOffset(offset) {
        return this.args('offset', offset);
    }
    setMessageStart(fromID) {
        return this.args('fromid', fromID);
    }

    setRMBToplistOptions(limit, from, to) {
        return this
                .setRMBToplistLimit(limit)
                .setRMBToplistFrom(from)
                .setRMBToplistTo(to);
    }
    setRMBToplistLimit(limit) {
        return this.args('limit', limit);
    }
    setRMBToplistFrom(from) {
        return this.args('from', from);
    }
    setRMBToplistTo(to) {
        return this.args('to', to);
    }

    /**
     * @override
     */
    async send() {
        return new Responses.Region(this, (await super.send())['REGION']);
    }
}

class WorldRequest extends ShardableCensusRequest {
    setBannerIDs(...ids) {
        this.requireShard(WorldShard.BANNER);
        return this.args('banner', ids?.join(','));
    }

    setDispatchID(id) {
        this.requireShard(WorldShard.DISPATCH);
        return this.args('dispatchid', id);
    }

    setDispatchOptions(author, category, sortMode) {
        return this
                .setDispatchAuthor(author)
                .setDispatchCategory(category)
                .setDispatchSortMode(sortMode);
    }
    setDispatchAuthor(author) {
        this.requireShard(WorldShard.DISPATCH_LIST);
        return this.args('dispatchauthor', author?.toLowerCase().replace(/ /g, '_'));
    }
    setDispatchCategory(category) {
        this.requireShard(WorldShard.DISPATCH_LIST);
        return this.args('dispatchcategory', category);
    }
    setDispatchSortMode(mode) {
        this.requireShard(WorldShard.DISPATCH_LIST);
        return this.args('dispatchsort', mode);
    }

    setRegionSearchTags(...tags) {
        this.requireShard(WorldShard.REGIONS_BY_TAG);
        return this.args('tags', tags?.join(','));
    }

    setHappeningsNations(...nname) {
        this.requireShard(WorldShard.HAPPENINGS);
        return this.args('view', `nation.${nname?.join(',')?.toLowerCase().replace(/ /g, '_')}`);
    }
    setHappeningsRegions(...rname) {
        this.requireShard(WorldShard.HAPPENINGS);
        return this.args('view', `region.${rname?.join(',')?.toLowerCase().replace(/ /g, '_')}`);
    }
    setHappeningsFilters(...filters) {
        this.requireShard(WorldShard.HAPPENINGS);
        return this.args('filter', ...filters);
    }
    setHappeningsLimit(limit) {
        this.requireShard(WorldShard.HAPPENINGS);
        return this.args('limit', limit);
    }
    setHappeningsIDWindow(start, end) {
        this.requireShard(WorldShard.HAPPENINGS);
        return this
                .args('sinceid', start)
                .args('beforeid', end);
    }
    setHappeningsTimeWindow(start, end) {
        this.requireShard(WorldShard.HAPPENINGS);
        return this
                .args('sincetime', start)
                .args('beforetime', end);
    }

    setPollID(id) {
        this.requireShard(WorldShard.POLL);
        return this.args('pollid', id);
    }

    /**
     * @override
     */
    async send() {
        return new Responses.World(this, (await super.send())['WORLD']);
    }
}

class WARequest extends ShardableRequest {
    constructor(api, councilID) {
        super(api, 'wa');
        this.args('wa', councilID);
    }
    setResolutionID(id) {
        return this.args('id', id);
    }
    shard(...shards) {
        // Requesting any of the below shards only works in conjunction with the 'resolution' shard
        if(shards.includes(WAShard.VOTERS) || 
            shards.includes(WAShard.VOTE_TRACK) || 
            shards.includes(WAShard.DELEGATE_VOTE_LOG) || 
            shards.includes(WAShard.DELEGATE_VOTES)) this.requireShard(WAShard.RESOLUTION_AT_VOTE);
        return super.shard(shards);
    }

    /**
     * @override
     */
    async send() {
        return new Responses.WorldAssembly(this, (await super.send())['WA']);
    }
}

class VerificationRequest extends NationRequest {
    constructor(api, nname, checksum) {
        super(api, nname, 'a', 'checksum');
        this.args('a', 'verify');
        this.args('checksum', checksum);
    }
    setToken(token) {
        return this.args('token', token);
    }

    /**
     * @override
     */
    async send() {
        let res = (await this.api.sendRequest(this)).trim();
        if(res == 1) return true;
        else if(res == 0) return false;
        else return new Responses.Nation(this, (await parser.parseStringPromise(res))['NATION']);
    }
}

class UserAgentRequest extends NSRequest {
    constructor(api) {
        super(api, 'a');
        this.args('a', 'useragent');
    }
    
    /**
     * @override
     */
    async send() {
        return toString(await this.api.sendRequest(this));
    }
}

class CommandRequest extends NSRequest {
    /**
     * @type {NSCredential}
     * @access protected
     */
    loginCredentials;
    constructor(api, nname, credential, ...required) {
        super(api, 'c', 'nation', ...required);
        this.args('nation', nname?.toLowerCase().replace(/ /g, '_'));
        if(credential) this.loginCredentials = credential;
        else throw new AuthenticationError();
    }
    /**
     * @override
     */
    async send() {
        return (await super.send())['NATION'];
    }
}
class TwoStepCommand extends CommandRequest {
    constructor(api, nname, credential, ...required) {
        super(api, nname, credential, 'mode', ...required);
        this.args('mode', 'prepare');
    }
    /**
     * @override
     */
    async send() {
        let token = (await super.send())['SUCCESS']?.[0];
        if(token) {
            this.args('mode', 'execute')
                .args('token', token);
            return await super.send();
        } else throw new NSError('No execution token was returned, something must have gone wrong!');
    }
}
class IssueCommand extends CommandRequest {
    constructor(api, nname, credential) {
        super(api, nname, credential, 'issue', 'option');
        this.args('c', 'issue');
    }

    select(issue, option) {
        return this.args('issue', issue)
            .args('option', option);
    }

    /**
     * @override
     */
    async send() {
        return new Responses.AnsweredIssue(await super.send());
    }
}
class GiftcardCommand extends TwoStepCommand {
    constructor(api, nname, credential) {
        super(api, nname, credential, 'cardid', 'season', 'to');
        this.args('c', 'giftcard');
    }

    setCard(id, season) {
        return this.args('cardid', id)
            .args('season', season);
    }
    setRecipient(target) {
        return this.args('to', target);
    }

    /**
     * @override
     */
    async send() {
        return (await super.send())['SUCCESS']?.[0];
    }
}
class DispatchCommand extends TwoStepCommand {
    constructor(api, nname, credential, action) {
        super(api, nname, credential, 'dispatch');
        this.args('c', 'dispatch')
            .args('dispatch', action);
    }

    targetDispatch(id) {
        return this.args('dispatchid', id);
    }
    setDispatchOptions(title, text, category) {
        return this
            .setDispatchTitle(title)
            .setDispatchContent(text)
            .setDispatchCategory(category);
    }
    setDispatchTitle(title) {
        return this.args('title', title);
    }
    setDispatchContent(text) {
        return this.args('text', text);
    }
    setDispatchCategory(category) {
        let cat, sub;
        switch(category) {
            case DispatchSubcategory.FACTBOOK.OVERVIEW:     cat = 1, sub = 100; break;
            case DispatchSubcategory.FACTBOOK.HISTORY:      cat = 1, sub = 101; break;
            case DispatchSubcategory.FACTBOOK.GEOGRAPHY:    cat = 1, sub = 102; break;
            case DispatchSubcategory.FACTBOOK.CULTURE:      cat = 1, sub = 103; break;
            case DispatchSubcategory.FACTBOOK.POLITICS:     cat = 1, sub = 104; break;
            case DispatchSubcategory.FACTBOOK.LEGISLATION:  cat = 1, sub = 105; break;
            case DispatchSubcategory.FACTBOOK.RELIGION:     cat = 1, sub = 106; break;
            case DispatchSubcategory.FACTBOOK.MILITARY:     cat = 1, sub = 107; break;
            case DispatchSubcategory.FACTBOOK.ECONOMY:      cat = 1, sub = 108; break;
            case DispatchSubcategory.FACTBOOK.INTERNATIONAL:cat = 1, sub = 109; break;
            case DispatchSubcategory.FACTBOOK.TRIVIA:       cat = 1, sub = 110; break;
            case DispatchSubcategory.FACTBOOK.MISCELLANEOUS:cat = 1, sub = 111; break;

            case DispatchSubcategory.BULLETIN.POLICY:       cat = 3, sub = 305; break;
            case DispatchSubcategory.BULLETIN.NEWS:         cat = 3, sub = 315; break;
            case DispatchSubcategory.BULLETIN.OPINION:      cat = 3, sub = 325; break;
            case DispatchSubcategory.BULLETIN.CAMPAIGN:     cat = 3, sub = 385; break;

            case DispatchSubcategory.ACCOUNT.MILITARY:      cat = 5, sub = 505; break;
            case DispatchSubcategory.ACCOUNT.TRADE:         cat = 5, sub = 515; break;
            case DispatchSubcategory.ACCOUNT.SPORT:         cat = 5, sub = 525; break;
            case DispatchSubcategory.ACCOUNT.DRAMA:         cat = 5, sub = 535; break;
            case DispatchSubcategory.ACCOUNT.DIPLOMACY:     cat = 5, sub = 545; break;
            case DispatchSubcategory.ACCOUNT.SCIENCE:       cat = 5, sub = 555; break;
            case DispatchSubcategory.ACCOUNT.CULTURE:       cat = 5, sub = 565; break;
            case DispatchSubcategory.ACCOUNT.OTHER:         cat = 5, sub = 595; break;

            case DispatchSubcategory.META.GAMEPLAY:         cat = 8, sub = 835; break;
            case DispatchSubcategory.META.REFERENCE:        cat = 8, sub = 845; break;
        }
        return this.args('category', cat)
            .args('subcategory', sub);
    }

    /**
     * @override
     */
     async send() {
        let res = await super.send();
        let num = res['SUCCESS']?.[0]?.replace(/\D*/gm, '');
        if(num) return parseInt(num);
    }
}
class RMBPostCommand extends TwoStepCommand {
    constructor(api, nname, credential) {
        super(api, nname, credential, 'region', 'text');
        this.args('c', 'rmbpost');
    }

    setPost(rname, text) {
        return this.args('region', rname)
            .args('text', text);
    }

    /**
     * @override
     */
     async send() {
        let res = await super.send();
        let num = res['SUCCESS']?.[0]?.replace(/\D*/gm);
        if(num) return parseInt(num.substring(0, num.length / 2));
    }
}


exports.NSCredential    = NSCredential;
exports.NSRequest       = NSRequest;

exports.NationRequest       = NationRequest;
exports.RegionRequest       = RegionRequest;
exports.UserAgentRequest    = UserAgentRequest;
exports.VerificationRequest = VerificationRequest;
exports.WorldRequest        = WorldRequest;
exports.WARequest           = WARequest;

exports.CommandRequest  = CommandRequest;
exports.IssueCommand    = IssueCommand;
exports.GiftcardCommand = GiftcardCommand;
exports.DispatchCommand = DispatchCommand;
exports.RMBPostCommand  = RMBPostCommand;