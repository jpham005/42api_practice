import * as fs from 'fs';
import { appDefine } from './model/appDefine.model.js';

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

async function sendApiRequest<ReturnType = any>(
  url: string
): Promise<ReturnType> {
  try {
    let isFirst: boolean = true;
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
  } catch (e) {
    console.error(`error: send: ${e}`);
    throw new Error();
  }
}

async function saveJsonToFile(filename: string = './data.json', json: any) {
  try {
    const fileHandle = await fs.promises.open(filename, 'w');
    try {
      await fileHandle.writeFile(JSON.stringify(json, null, '  '), {
        encoding: 'utf-8',
      });
    } catch {
      console.error(`error: saveJsonToFile`);
    } finally {
      await fileHandle.close();
    }
  } catch (e) {
    console.error(`error: saveJsonToFile: ${e}`);
    throw new Error();
  }
}

// todo: refactor getAll funcs. remove ReturnType[] generic

async function getAll<ReturnType, ApiDto>(
  filePath: string,
  url: string,
  dtoConvertor: (dto: ApiDto) => ReturnType
): Promise<ReturnType[]> {
  try {
    const fileData = await getJsonFromFile<ReturnType>(filePath);
    return fileData;
  } catch {
    try {
      console.log('trying to get user from 42 server...');
      const serverData = await getAllFromServer<ReturnType, ApiDto>(
        url,
        dtoConvertor
      );
      return serverData;
    } catch {
      console.error(`error: getAll`);
      throw new Error();
    }
  }
}

async function getAllFromServer<ReturnType, ApiDto>(
  url: string,
  dtoConvertor: (dto: ApiDto) => ReturnType
): Promise<ReturnType[]> {
  const json: ReturnType[] = [];

  let pageNumber: number = 1;
  let secondRun: number = 0;
  try {
    for (; ; pageNumber++) {
      let temp: ApiDto[];
      try {
        // todo: seperate here
        temp = await core.sendApiRequest<ApiDto[]>(
          `${url}&page[number]=${pageNumber}`
        );
      } catch {
        secondRun++;
        temp = await core.sendApiRequest<ApiDto[]>(
          `${url}&page[number]=${pageNumber}`
        );
      }

      if (temp.length === 0) break;

      console.log(pageNumber);

      try {
        await saveJsonToFile(
          `${appDefine.default_data_dir}/tmp/${pageNumber}.json`,
          temp
        );
      } catch (e) {
        console.error(`todo...: ${e}`);
        try {
          await saveJsonToFile(
            `${appDefine.default_data_dir}/tmp/${pageNumber}.json`,
            temp
          );
        } finally {
        }
      }

      json.push(...temp.map((curr) => dtoConvertor(curr)));
    }
  } catch {
    await saveJsonToFile(
      `${appDefine.default_data_dir}/errorDump.json`,
      JSON.stringify(json)
    );
    console.error(`error: getAllFromServer at pageNumber ${pageNumber}`);
    throw new Error();
  } finally {
    console.log(`secondRun: ${secondRun}`);
  }

  return json;
}

async function getJsonFromFile<ReturnType>(
  filePath: string
): Promise<ReturnType[]> {
  try {
    const fileHandle = await fs.promises.open(filePath, 'r');
    try {
      const jsonString = await fileHandle.readFile({ encoding: 'utf-8' });
      const json: ReturnType[] = JSON.parse(jsonString);
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
  getAll,
  getAllFromServer,
  getJsonFromFile,
};

function isTokenErrorResponse(status: number): boolean {
  return status === 401 || status === 429;
}
