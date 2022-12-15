import { core } from '../core.js';
import { appDefine } from '../model/appDefine.model.js';
import { ScaleTeam, ScaleTeamDto } from '../model/scaleTeam.model.js';

const scaleTeamUrl = `scale_teams?filter[campus_id]=29&page[size]=100&range[filled_at]=2022-01-01T00:00:00.000Z,2022-12-13T11:59:59.999Z`;
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
  isPiscine: true,
});

async function getAll(
  filePath: string = `${appDefine.default_data_dir}/scaleTeams.json`
) {
  try {
    const scaleTeams = await core.getAll<ScaleTeam, ScaleTeamDto>(
      filePath,
      scaleTeamUrl,
      convertor
    );
    return scaleTeams;
  } catch {
    console.error(`error: scaleTeam.getAll`);
    throw new Error();
  }
}

async function save(scaleTeams: ScaleTeam[]) {
  try {
    await core.saveJsonToFile(
      `${appDefine.default_data_dir}/scaleTeams.json`,
      scaleTeam
    );
  } catch {
    console.error(`error: scaleTeam.save`);
    throw new Error();
  }
}

export const scaleTeam = {
  getAll,
  save,
};
