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

dotenv.config();

const getIsPiscine = (path: string) => {
  return path.search('c-piscine') != -1;
};

const convertor = (scaleTeamDto: ScaleTeamDto) => ({
  id: scaleTeamDto.id,
  comment: scaleTeamDto.comment,
  createdAt: scaleTeamDto.created_at,
  updatedAt: scaleTeamDto.updated_at,
  feedback: scaleTeamDto.feedback,
  finalMark: scaleTeamDto.final_mark,
  flag: scaleTeamDto.flag,
  beginAt: scaleTeamDto.begin_at,
  filledAt: scaleTeamDto.filled_at,
  correcteds: scaleTeamDto.correcteds,
  corrector: scaleTeamDto.corrector,
  teamId: scaleTeamDto.team.id,
  isPiscine: getIsPiscine(scaleTeamDto.team.project_gitlab_path),
});

interface userEvalSum {
  [key: string]: number;
}

async function main() {
  const scaleTeams: ScaleTeam[] = [];

  for (let i = 1; i < 1032; i++) {
    const curr: ScaleTeamDto[] = JSON.parse(
      await fs.promises.readFile(`/tmp/data/tmp/${i}.json`, {
        encoding: 'utf-8',
      })
    );

    scaleTeams.push(...curr.map((single) => convertor(single)));

    // await fileHandle.writeFile(JSON.stringify(curr.map(), null, 2), {
    //   encoding: 'utf-8',
    // });
  }

  let users = new Map<string, number>();
  let totalLen = 0;
  let totalMark = 0;
  let totalOutstanding = 0;
  let mark = 0;
  let cnt = 0;
  let comments: string[] = [];
  const searching = 'yoonsele';
  const outstanding = 'Outstanding project';

  scaleTeams.forEach((curr) => {
    if (curr.isPiscine === true) {
      return;
    }

    if (!curr?.corrector?.login) {
      console.log(curr.id);
      console.log(curr.corrector);
      return;
    }

    totalMark += curr.finalMark;
    totalLen++;

    if (curr.corrector.login === searching) {
      mark += curr.finalMark;
      cnt++;
    }

    if (curr.flag.name === outstanding) {
      totalOutstanding++;
    }

    if (curr.correcteds.find((user) => user.login === searching)) {
      if (curr.flag.name === outstanding) {
        comments.push(curr.comment);
      }
    }

    const num = users?.get(curr?.corrector?.login);
    users.set(
      curr.corrector.login,
      users.has(curr.corrector.login) ? num + 1 : 1
    );
  });

  console.log(
    'total avg. eval cnt: ' + Math.floor(totalLen / users.size),
    'total avg. final mark: ' + (totalMark / totalLen).toFixed(3)
  );
  console.log(
    `${searching}'s eval cnt: ` + cnt,
    `${searching}'s avg. final mark: ` + (mark / cnt).toFixed(3)
  );

  comments.forEach((comment) => console.log(comment + '\n'));

  console.log(totalOutstanding / users.size, comments.length);
}

// 2022 01 01 ~ 2022 12 12 11 59 59

// main();

async function test() {
  const searching = 'jinam';

  const users = await campusUsers.getAll('/tmp/data/campusUsers.json');
  const user = users.find((user) => user.login === searching);

  console.log(users[104]);
}

// test();
main();
