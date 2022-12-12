var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
let accessToken = null;
function getAccessToken() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch('https://api.intra.42.fr/oauth/token', {
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: clientId,
                client_secret: clientSecret,
            }),
        });
        if (!response.ok) {
            console.log(response.status);
            throw new Error('fail to get access token');
        }
        const token = yield response.json();
        accessToken = token.access_token;
        console.log(`accessToken Issued: ${accessToken}`);
    });
}
let isFirst = true;
function send(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`https://api.intra.42.fr/v2/${url}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        if (!response.ok) {
            if (isTokenErrorResponse(response.status) === true && isFirst === true) {
                yield getAccessToken();
                isFirst = false;
                return yield send(url);
            }
            console.error(`api failed status: ${response.status}`);
            throw new Error(`response status: ${response.status}`);
        }
        isFirst = true;
        const responseJson = yield response.json();
        return responseJson;
    });
}
function writeResponseToFile(responseData) {
    return __awaiter(this, void 0, void 0, function* () {
        const fd = fs.openSync('/tmp/api_response.json', 'w', 0o666);
        fs.writeSync(fd, JSON.stringify(responseData));
        fs.closeSync(fd);
    });
}
function logResponse(responseData) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(responseData);
    });
}
export const apiRequestManager = {
    send,
    writeResponseToFile,
    logResponse,
};
function isTokenErrorResponse(status) {
    return status === 401 || status === 429;
}
