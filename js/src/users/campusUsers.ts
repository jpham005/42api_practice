import { core } from '../core.js';
import { User, UserApiDto } from '../model/user.model.js';
import { apiDefines } from '../model/apiDefine.model.js';
import * as fs from 'fs';
import { appDefine } from '../model/appDefine.model.js';

async function getAll(
  filePath: string = `${appDefine.default_data_dir}/campusUser.json`
) {
  try {
    const fileData = await getAllFromFile(filePath);
    return fileData;
  } catch {
    try {
      console.log('tring to get user from 42 server...');
      const serverData = await getAllFromServer();
      return serverData;
    } catch {
      console.error(`error: getAll`);
      throw new Error();
    }
  }
}

async function getAllFromServer() {
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

async function getAllFromFile(
  filePath: string = `${appDefine.default_data_dir}/campusUsers.json`
) {
  try {
    const fileHandle = await fs.promises.open(filePath, 'r');
    try {
      const users = await fileHandle.readFile({ encoding: 'utf-8' }); // todo: data fetcher wrapper
      const usersJson: User[] = JSON.parse(users);
      return usersJson;
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

async function save(
  users: User[],
  filePath: string = '/tmp/data/campusUsers.json'
) {
  try {
    await core.saveJsonToFile(filePath, users);
  } catch {
    console.error(`error: save`);
    throw new Error();
  }
}

export const campusUsers = {
  getAll,
  getAllFromFile,
  getAllFromServer,
  save,
};
