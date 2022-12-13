import { User } from '../model/user.model.js';

function cursus(users: User[]) {
  const newUsers = users.filter((curr) => isCursusAccount(curr));
  return newUsers;
}

function active(users: User[]) {
  const newUsers = users.filter((curr) => isActiveAccount(curr));
  return newUsers;
}

function seoul(users: User[]) {
  const newUsers = users.filter((curr) => isSeoulAccount(curr));
  return newUsers;
}

export const userFilter = {
  cursus,
  active,
  seoul,
};

// utils
const isCursusAccount = (user: User) => {
  const diffMs =
    new Date(user.updatedAt).getTime() - new Date(user.createdAt).getTime();
  const diffDay = diffMs / 1000 / 60 / 60 / 24;
  return diffDay >= 40;
};

const isActiveAccount = (user: User) => {
  return user.active === true;
};

const isSeoulAccount = (user: User) => {
  return user.email.endsWith('@student.42seoul.kr');
};
