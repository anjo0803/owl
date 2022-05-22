class NSError extends Error {
    constructor(msg) {
        super(msg || 'There was an error!');
        this.name = 'NSError';
    }
}

class APIInstanceError extends NSError {
    constructor() {
        super('No API instance was provided for this request!');
        this.name = 'APIInstanceError';
    }
}

class UserAgentError extends NSError {
    constructor() {
        super('No UserAgent has been set; one is required as part of the NS API ToS!');
        this.name = 'UserAgentError';
    }
}

class AuthenticationError extends NSError {
    constructor() {
        super('The nation authentification required for this request has not been provided!');
        this.name = 'AuthenticationError';
    }
}
class RecentLoginError extends NSError {
    constructor() {
        super('The previous login via password for this nation was too recent and no valid PIN was found!');
        this.name = 'AuthenticationError';
    }
}
class InvalidCredentialsError extends NSError {
    constructor() {
        super('The nation authentification provided for this request is not valid!');
        this.name = 'AuthenticationError';
    }
}

class MissingArgumentsError extends NSError {
    constructor(...args) {
        super('This request misses the following required arguments: ' + args.join(', '));
        this.name = 'MissingArgumentsError';
    }
}

exports.NSError                 = NSError;
exports.APIInstanceError        = APIInstanceError;
exports.UserAgentError          = UserAgentError;
exports.AuthenticationError     = AuthenticationError;
exports.RecentLoginError        = RecentLoginError;
exports.InvalidCredentialsError = InvalidCredentialsError;
exports.MissingArgumentsError   = MissingArgumentsError;