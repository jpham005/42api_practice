import * as fs from 'fs';

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
if (process.env.ACCESS_TOKEN) {
  accessToken = process.env.ACCESS_TOKEN;
}

async function getAccessToken() {
  try {
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
  } catch {
    console.error(`error: getAccessToken`);
    throw new Error();
  }
}

let isFirst: boolean = true;
async function send<returnType = any>(url: string): Promise<returnType> {
  try {
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

      console.error(`error: api failed status: ${response.status}`);
      throw new Error(`response status: ${response.status}`);
    }

    isFirst = true;

    const responseJson: returnType = await response.json();
    return responseJson;
  } catch {
    console.error(`error: send`);
    throw new Error();
  }
}

async function writeJsonToFile(filename: string = './data.json', json: any) {
  try {
    const fileHandle = await fs.promises.open(filename, 'w');
    try {
      await fileHandle.writeFile(JSON.stringify(json, null, '  '));
    } catch {
      console.error(`error: writeJsonToFile`);
    } finally {
      await fileHandle.close();
    }
  } catch {
    console.error(`error: writeJsonToFile`);
    throw new Error();
  }
}

export const apiRequestManager = {
  send,
  writeJsonToFile,
};

function isTokenErrorResponse(status: number): boolean {
  return status === 401 || status === 429;
}
