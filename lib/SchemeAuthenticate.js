"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemeAuthenticate = void 0;
const Boom = require('@hapi/boom');
exports.SchemeAuthenticate = (saml, settings, samlCredsPropKey) => (request, h) => __awaiter(void 0, void 0, void 0, function* () {
    const state = request.state;
    let session = state[settings.cookie];
    if (!session) {
        if (saml.getSamlProps().authnRequestBinding === 'HTTP-POST') {
            const loginForm = yield new Promise((resolve, reject) => {
                const query = request.query;
                query.RelayState = request.path;
                saml.getSamlLib().getAuthorizeForm({
                    headers: request.headers,
                    body: request.payload,
                    query: query
                }, function (err, loginUrl) {
                    if (err)
                        reject(err);
                    else
                        resolve(loginUrl);
                });
            });
            return h.response(loginForm).takeover();
        }
        else {
            const loginUrl = yield new Promise((resolve, reject) => {
                const query = request.query;
                query.RelayState = request.path;
                saml.getSamlLib().getAuthorizeUrl({
                    headers: request.headers,
                    body: request.payload,
                    query: query
                }, saml.props, function (err, loginUrl) {
                    if (err)
                        reject(err);
                    else
                        resolve(loginUrl);
                });
            });
            return h.redirect(loginUrl).takeover();
        }
    }
    if (session && session[samlCredsPropKey]) {
        if (settings.keepAlive) {
            h.state(settings.cookie, session);
        }
        return h.authenticated({
            credentials: session[samlCredsPropKey]
        });
    }
    if (request.auth.mode === 'try') {
        throw Boom.unauthorized('Not authenticated');
    }
    throw Boom.unauthorized('Unauthorized', 'saml');
});
//# sourceMappingURL=SchemeAuthenticate.js.map