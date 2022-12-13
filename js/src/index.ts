import * as dotenv from 'dotenv';
import { appDefine } from './model/appDefine.model.js';
import { campusUsers } from './users/campusUsers.js';

dotenv.config();

async function main() {
  const users = await campusUsers.getAll();
  const seoulUsers = campusUsers.getSeoulUser(users);
  const activeUsers = campusUsers.getActiveUser(seoulUsers);
  await campusUsers.save(users);
}
