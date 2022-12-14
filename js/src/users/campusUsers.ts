import { core } from '../core.js';
import { User, UserApiDto } from '../model/user.model.js';
import { apiDefines } from '../model/apiDefine.model.js';
import * as fs from 'fs';
import { appDefine } from '../model/appDefine.model.js';

// todo: should split params
const campusUserUrl = `campus/${apiDefines.seoulCampusId}/users?&page[size]=${apiDefines.maxPageSize}&filter[kind]=student`;
// todo: should implement interface
const convertor = (userApiDto: UserApiDto): User => ({
  id: userApiDto.id,
  email: userApiDto.email,
  login: userApiDto.login,
  correctionPoint: userApiDto.correction_point,
  poolYear: userApiDto.pool_year,
  poolMonth: userApiDto.pool_month,
  wallet: userApiDto.wallet,
  active: userApiDto['active?'],
  createdAt: userApiDto.created_at,
  updatedAt: userApiDto.updated_at,
});

async function getAll(
  filePath: string = `${appDefine.default_data_dir}/campusUser.json`
) {
  try {
    const users = await core.getAll<User, UserApiDto>(
      filePath,
      campusUserUrl,
      convertor
    );
    return users;
  } catch {
    console.error(`error: campusUser.getAll`);
    throw new Error();
  }
}

async function getAllFromServer() {
  try {
    const users = await core.getAllFromServer<User, UserApiDto>(
      campusUserUrl,
      convertor
    );
    return users;
  } catch {
    console.error(`error: campusUser.getAllFromServer`);
    throw new Error();
  }
}

async function getAllFromFile(
  filePath: string = `${appDefine.default_data_dir}/campusUsers.json`
) {
  try {
    core.getJsonFromFile<User>(filePath);
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
