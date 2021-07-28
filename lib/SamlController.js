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
const Boom = require('@hapi/boom');
/**
 * Endpoint to retrieve metadata
 * @function
 * @param {Object} request - A Hapi Request
 * @param {Object} h - A Hapi response toolkit
 */
exports.getMetadata = (saml) => (request, h) => {
    const response = h.response(saml.getSamlLib().generateServiceProviderMetadata(saml.props.decryptionCert, saml.props.signingCert));
    response.type('application/xml');
    return response;
};
/**
 * Assert endpoint for when login completes
 * @function
 * @param {Object} request - A Hapi Request
 * @param {Object} h - A Hapi response toolkit
 */
exports.assert = (saml, onAssertRes, onAssertReq, cookieName, samlCredsPropKey) => (request, h) => __awaiter(void 0, void 0, void 0, function* () {
    if (request.payload.SAMLRequest) {
        // Implement your SAMLRequest handling here
        if (onAssertReq) {
            return onAssertReq(request, h);
        }
        throw new Error('Invalid assertion request');
    }
    if (request.payload.SAMLResponse) {
        // Handles SP use cases, e.g. IdP is external and SP is Hapi
        try {
            const profile = yield new Promise((resolve, reject) => {
                saml.validatePostResponse(request.payload, (err, profile) => {
                    if (err)
                        reject(err);
                    else
                        resolve(profile);
                });
            });
            if (onAssertRes) {
                // delete unecessery profile data
                delete profile['nameQualifier'];
                delete profile['spNameQualifier'];
                delete profile['http://schemas.microsoft.com/ws/2008/06/identity/claims/groups'];
                // the callback shall return the reply object after using it to redirect/response.
                const replyFromCallback = onAssertRes(profile, request, h);
                h.state(cookieName, { [samlCredsPropKey]: profile });
                return replyFromCallback;
            }
            throw Boom.badImplementation('onAssert is missing');
        }
        catch (err) {
            if (err.message.indexOf('SAML assertion expired') > -1) {
                return h.redirect('/');
            }
            throw Boom.unauthorized(err.message, 'saml');
        }
        console.log('hapi-corpsso->lib->SamlController->end');
    }
});
//# sourceMappingURL=SamlController.js.map