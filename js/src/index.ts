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

interface MonthlyCount {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  6: number;
  7: number;
  8: number;
  9: number;
  10: number;
  11: number;
  12: number;
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

  const newScaleTeam = scaleTeams.filter((curr) => !curr.isPiscine);

  const monthlyCount: number[] = [];

  for (let i = 0; i < 12; i++) {
    monthlyCount[i] = 0;
  }

  newScaleTeam.forEach((curr) => {
    const filledDate = new Date(curr.filledAt);
    const filledMonth = filledDate.getMonth();

    monthlyCount[filledMonth]++;
  });

  monthlyCount.forEach((curr, index) => console.log(`${index + 1}\t${curr}`));
}

// 2022 01 01 ~ 2022 12 12 11 59 59
main();
