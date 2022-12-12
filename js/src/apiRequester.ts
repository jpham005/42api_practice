import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

interface Token {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  created_at: number;
}

let accessToken: string | null = null;

async function getAccessToken() {
  const response = await fetch('https://api.intra.42.fr/oauth/token', {
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

  const token: Token = await response.json();
  accessToken = token.access_token;
  console.log(`accessToken Issued: ${accessToken}`);
}

let isFirst: boolean = true;
async function send<returnType = any>(url: string): Promise<returnType> {
  const response = await fetch(`https://api.intra.42.fr/v2/${url}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    if (isTokenErrorResponse(response.status) === true && isFirst === true) {
      await getAccessToken();
      isFirst = false;
      return await send<returnType>(url);
    }

    console.error(`api failed status: ${response.status}`);
    throw new Error(`response status: ${response.status}`);
  }

  isFirst = true;

  const responseJson: returnType = await response.json();
  return responseJson;
}

async function writeResponseToFile(responseData: JSON) {
  const fd = fs.openSync('/tmp/api_response.json', 'w', 0o666);
  fs.writeSync(fd, JSON.stringify(responseData));
  fs.closeSync(fd);
}

async function logResponse(responseData: JSON) {
  console.log(responseData);
}

export const apiRequestManager = {
  send,
  writeResponseToFile,
  logResponse,
};

function isTokenErrorResponse(status: number): boolean {
  return status === 401 || status === 429;
}
