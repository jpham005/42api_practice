import * as fs from 'fs';
import { appDefine } from './model/appDefine.model';

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
async function sendApiRequest<ReturnType = any>(
  url: string
): Promise<ReturnType> {
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
        return await sendApiRequest<ReturnType>(url);
      }

      console.error(`error: api failed status: ${response.status}`);
      throw new Error(`response status: ${response.status}`);
    }

    isFirst = true;

    const responseJson: ReturnType = await response.json();
    return responseJson;
  } catch {
    console.error(`error: send`);
    throw new Error();
  }
}

async function saveJsonToFile(filename: string = './data.json', json: any) {
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

async function getAll<ReturnType>(filePath: string): Promise<ReturnType> {
  try {
    const fileData = await getJsonFromFile<ReturnType>(filePath);
    return fileData;
  } catch {
    try {
      console.log('tring to get user from 42 server...');
      const serverData = await getAllFromServer<ReturnType>();
      return serverData;
    } catch {
      console.error(`error: getAll`);
      throw new Error();
    }
  }
}

async function getAllFromServer<ReturnType>(): Promise<ReturnType> {
  const users: User[] = [];

  try {
    for (let pageNumber: number = 1; ; pageNumber++) {
      const temp = await core.sendApiRequest<UserApiDto[]>(
        `campus/${apiDefines.seoulCampusId}/users?page[number]=${pageNumber}&page[size]=${apiDefines.maxPageSize}&filter[kind]=student`
      );

      if (temp.length === 0) break;

      users.push(
        ...temp.map(
          (curr): User => ({
            id: curr.id,
            email: curr.email,
            login: curr.login,
            correctionPoint: curr.correction_point,
            poolYear: curr.pool_year,
            poolMonth: curr.pool_month,
            wallet: curr.wallet,
            active: curr['active?'],
            createdAt: curr.created_at,
            updatedAt: curr.updated_at,
          })
        )
      );
    }
  } catch {
    console.error(`error: getAllFromServer`);
    throw new Error();
  }

  return users;
}

async function getJsonFromFile<ReturnType>(
  filePath: string
): Promise<ReturnType> {
  try {
    const fileHandle = await fs.promises.open(filePath, 'r');
    try {
      const jsonString = await fileHandle.readFile({ encoding: 'utf-8' });
      const json: ReturnType = JSON.parse(jsonString);
      return json;
    } catch {
      throw new Error();
    } finally {
      await fileHandle.close();
    }
  } catch {
    console.error(`error: getAllFromFile`);
    throw new Error();
  }
}

export const core = {
  sendApiRequest,
  saveJsonToFile,
};

function isTokenErrorResponse(status: number): boolean {
  return status === 401 || status === 429;
}
