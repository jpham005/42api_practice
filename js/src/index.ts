import * as dotenv from 'dotenv';
import { appDefine } from './model/appDefine.model.js';
import { campusUsers } from './users/campusUsers.js';
import * as fs from 'fs';
import { scaleTeam } from './scaleTeam/scaleTeam.js';
import { core } from './core.js';
import {
  ScaleTeam,
  ScaleTeamDto,
  ScaleTeamUser,
} from './model/scaleTeam.model.js';
import { userFilter } from './users/userFilters.js';
import { User } from './model/user.model.js';
import { Core } from './newCore/Core.js';

dotenv.config();

const getIsPiscine = (path: string) => {
  return path.search('c-piscine') != -1;
};

interface CustomUser extends User {
  cursus_users: [
    {
      grade: string;
      blackholed_at: string;
    }
  ];
}
/*
    {
      grade: 'Learner',
      level: 3.95,
      skills: [Array],
      blackholed_at: '2022-10-18T01:00:00.000Z',
      id: 145524,
      begin_at: '2021-11-08T01:00:00.000Z',
      end_at: '2022-10-19T01:00:14.665Z',
      cursus_id: 21,
      has_coalition: true,
      created_at: '2021-11-03T10:15:25.855Z',
      updated_at: '2022-10-19T01:00:13.670Z',
      user: [Object],
      cursus: [Object]
    }
    */

async function main() {
  const sender = new Core();

  const cursusUsers: User[] = JSON.parse(
    await fs.promises.readFile('/tmp/data/cursusUsers.json', {
      encoding: 'utf-8',
    })
  );

  console.log(`cursus user count: ${cursusUsers.length}`);

  const activeUsers: User[] = [];
  const deactiveUsers: User[] = [];

  cursusUsers.forEach((curr) => {
    if (curr.active === true) {
      activeUsers.push(curr);
      return;
    }

    deactiveUsers.push(curr);
  });

  console.log(`active users: ${activeUsers.length}`);
  console.log(`deactive users: ${deactiveUsers.length}`);

  const errorFile = await fs.promises.open('/tmp/data/errorDump.json');
  const deactiveFile = await fs.promises.open('/tmp/data/deactiveUsers.json');

  for (const curr of deactiveUsers) {
    const response: CustomUser = await sender.sendApiRequest(
      `users/${curr.id}`
    );

    if (response.cursus_users === undefined) {
      await errorFile.appendFile(`${response.id}\n`);
    }

    for (const currCursus of response.cursus_users) {
      if (currCursus.grade.toUpperCase() === 'learner'.toUpperCase()) {
        await deactiveFile.appendFile(
          JSON.stringify(
            {
              id: response.id,
              login: response.login,
              blackholed_at: currCursus.blackholed_at,
            },
            null,
            '  '
          ),
          {
            encoding: 'utf-8',
          }
        );
      } else {
        console.log('is Piscine');
      }
    }
  }
}

// 2022 01 01 ~ 2022 12 12 11 59 59
main();
