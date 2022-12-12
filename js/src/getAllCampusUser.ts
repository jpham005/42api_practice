import { apiRequestManager } from './apiRequester.js';
import { User } from './model/user.model.js';

export async function getAllCampusUser() {
  const users = await apiRequestManager.send<User[]>(
    'campus/29/users?page[number]=1&page[size]=100&filter[kind]=student'
  );

  users.forEach((curr) => console.log(curr));
}
