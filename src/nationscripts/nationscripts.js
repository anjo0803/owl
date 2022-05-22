
const APIRequest = require('./requests');
const { NSError, 
        AuthenticationError, 
        RecentLoginError, 
        InvalidCredentialsError, 
        UserAgentError } = require('./exceptions');
const { NationPrivateShard } = require('./enums');

class NSAPI {
    #useragent;
    constructor(agent) {
        if(agent) this.#useragent = agent;
        else throw new UserAgentError();
    }
    set agent(newUserAgent) {
        if(newUserAgent) this.#useragent = newUserAgent;
    }
    get agent() {
        return this.#useragent;
    }

    #autoauth;
    set permanentAuthentication(credential) {
        this.#autoauth = credential;
    }

    createCredentials(password, autologin) {
        return new APIRequest.NSCredential(password, autologin, undefined);
    }

    /* ===== Stuff for instantiating API requests ===== */

    nation(name) {
        let ret = new APIRequest.NationRequest(this, name);
        if(this.#autoauth) ret.authenticate(this.#autoauth);
        return ret;
    }
    region(name) {
        return new APIRequest.RegionRequest(this, name);
    }
    world() {
        return new APIRequest.WorldRequest(this);
    }
    wa(council) {
        return new APIRequest.WARequest(this, council)
    }
    verify(name, checksum) {
        return new APIRequest.VerificationRequest(this, name, checksum);
    }
    ua() {
        return new APIRequest.UserAgentRequest(this);
    }

    issue(name, login = this.#autoauth) {
        return new APIRequest.IssueCommand(this, name, login);
    }
    giftcard(name, login = this.#autoauth) {
        return new APIRequest.GiftcardCommand(this, name, login);
    }
    createDispatch(name, login = this.#autoauth) {
        return new APIRequest.DispatchCommand(this, name, login, 'add');
    }
    editDispatch(name, login = this.#autoauth) {
        return new APIRequest.DispatchCommand(this, name, login, 'edit');
    }
    deleteDispatch(name, login = this.#autoauth) {
        return new APIRequest.DispatchCommand(this, name, login, 'remove');
    }

    /* ===== Stuff for executing API requests ===== */

    /**
     * @type {number[]}
     * @private
     */
    #requests = [];
    /**
     * @private
     * @readonly
     */
    #ratelimit = {
        period: 30000,
        amount: 49
    };

    /**
     * @private
     * @returns 
     */
    async #complyWithLimit() {

        /*
        * Calculation of how long to wait before authorizing the impending request:
        * - If the request max has not been reached, the result is 0.
        * - Otherwise, it is the difference between now and the expiration time of 49 requests ago.
        * By pushing the expected time the impending request can proceed, the expiration time of 49 requests
        * ago is "claimed" and the calculation would only consider the next-younger request expiration.
        * To keep the requests array length up to date, an expired request timestamp removes itself.
        */
        let now = Date.now();
        let diff = this.#requests.length >= this.#requests.amount 
                ? this.#requests[this.#requests.length - this.#requests.amount] - now 
                : 0;
        let expires = now + diff + this.#requests.period;

        this.#requests.push(expires);
        setTimeout(() => this.#requests.splice(this.#requests.indexOf(expires), 1), diff + this.#ratelimit.period);

        // If necessary, wait the required amount of time until the calculated expiration
        if(diff > 0) await new Promise((resolve, reject) => setTimeout(() => resolve(), diff));
        return;
    }

    /**
     * 
     * @param {APIRequest.NSRequest} request 
     * @returns 
     * @access protected
     */
    async sendRequest(request) {
        if(!this.#useragent) throw new UserAgentError();

        // Prepare the request body in the format of a query string
        let body = '';
        for(let key of request.getArguments()) body = `${body.length > 0 ? body + '&' : ''}${key}=${encodeURIComponent(request.getArgument(key))}`;
        let bodyBytes = (new TextEncoder().encode(body)).length;

        // Prepare the request headers
        let headers = new Headers({
            'User-Agent': this.#useragent,
            'Content-Length': bodyBytes.toString(),
            'Content-Type': 'application/x-www-form-urlencoded',
            'charset': 'utf-8'
        });

        // For nation private shards or nation commands, require that authentication is provided
        if((request instanceof APIRequest.NationRequest) || (request instanceof APIRequest.CommandRequest)) {
            let { loginCredentials } = request;
            if(loginCredentials) {
                if(loginCredentials.pwd)    headers.set('X-Password', loginCredentials.pwd);
                if(loginCredentials.auto)   headers.set('X-Autologin', loginCredentials.auto);
                if(loginCredentials.pin)    headers.set('X-Pin', loginCredentials.pin);
            } else if(request instanceof APIRequest.NationRequest) {
                for(let shard in NationPrivateShard) if(request.getShards()?.includes(NationPrivateShard[shard]))
                    throw new AuthenticationError();
            } else throw new AuthenticationError();
        }

        // Make sure to meet the ratelimit, then send the request
        await this.#complyWithLimit();
        console.log(body);
        console.log(request.loginCredentials);
        return fetch('https://www.nationstates.net/cgi-bin/api.cgi', {
            method: 'POST',
            headers: headers,
            body: body
        }).then(r => {
            if(r.ok) {
                let { loginCredentials } = request;
                if(loginCredentials) loginCredentials.fromHeaders = r.headers;
                return r.text();
            } else {
                if(r.status == 403) throw new InvalidCredentialsError();
                else if(r.status == 409) throw new RecentLoginError();
                else throw new NSError('The NS API returned an unknown error!');
            }
        }, () => {
            throw new NSError('An unknown error occurred while contacting the NS API!');
        });
    }
}

exports.API = NSAPI;
exports.ENUMS = require('./enums');