const functions = require('firebase-functions');
// const util = require('util');

const appClientId = functions.config().linkedin.client_id;
const appClientSecret = functions.config().linkedin.client_secret;
const redirectURI = `http://localhost:3000/login`;

const OAUTH_SCOPES = ['r_liteprofile', 'r_emailaddress', 'w_member_social'];

const authorize = (state, res=undefined) => {

    let url = util.format("https://www.linkedin.com/oauth/v2/authorization?response_type=code" +
        "&client_id=%s" +
        "&state=%s" +
        "&redirect_uri=%s",
        appClientId,
        encodeURIComponent(state),
        encodeURIComponent(redirectURI)
    );

    url += '&scope=' + OAUTH_SCOPES.join('%20');

    if(res !== undefined) return res.redirect(url)
    return url;
};

const getAccessToken = (res, code, stateOut, cb) => {

    if (typeof res == 'string') {
        cb = stateOut;
        stateOut = code;
        code = res;
        res = null;
    }

    var state = states[stateOut];

    if (!state) {
        var err = new Error('Possible CSRF attack, state parameters do not match.');
        err.name = 'CSRF Alert';
        return cb(err, null);
    }

    delete states[stateOut];

    var url = "https://www.linkedin.com/oauth/v2/accessToken",
        form = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": state.redirectURI,
            "client_id": args.appId,
            "client_secret": args.appSecret
        };
    request.post({url: url, form: form}, function (err, response, body) {

        if (err)
            return cb(err, null);

        var res = JSON.parse(body);

        if (typeof res.error !== 'undefined') {
            err = new Error(res.error_description);
            err.name = res.error;
            return cb(err, null);
        }

        return cb(null, res);

    })
};

module.exports = { authorize, getAccessToken };